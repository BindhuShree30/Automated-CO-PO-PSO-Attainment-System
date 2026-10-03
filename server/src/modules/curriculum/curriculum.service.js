import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

import { PDFParse } from "pdf-parse";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { createCanvas, ImageData } from "@napi-rs/canvas";
import { createWorker } from "tesseract.js";

import {
  Faculty,
  FacultyAssignment,
  CourseOffering,
  Syllabus,
  Course,
} from "../../database/index.js";

import ApiError from "../../shared/errors/ApiError.js";

/* ============================================================
   CONFIGURATION
============================================================ */

const OCR_LANGUAGE = "eng";

/*
 * Increase rendering resolution.
 * 3 is slower but much better for scanned syllabus PDFs.
 */
const PDF_RENDER_SCALE = 3;

/*
 * Minimum text required to consider extraction successful.
 */
const MIN_DOCUMENT_TEXT_LENGTH = 40;

/*
 * Minimum text required from one page.
 */
const MIN_PAGE_TEXT_LENGTH = 10;

/* ============================================================
   TEXT CLEANING
============================================================ */

const normalizeText = (text) => {
  if (!text) {
    return "";
  }

  return String(text)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const cleanExtractedText = (text) => {
  if (!text) {
    return "";
  }

  return normalizeText(text)
    .replace(
      /---\s*Page\s+\d+\s*---/gi,
      ""
    )
    .replace(
      /\[UNREADABLE PAGE\]/gi,
      ""
    )
    .replace(
      /\[UNREADABLE\]/gi,
      ""
    )
    .trim();
};

/* ============================================================
   VALIDATION
============================================================ */

const isMeaningfulText = (text) => {
  const cleaned = cleanExtractedText(text);

  if (!cleaned) {
    return false;
  }

  const alphanumeric =
    cleaned.replace(
      /[^a-zA-Z0-9]/g,
      ""
    );

  return (
    alphanumeric.length >=
    MIN_DOCUMENT_TEXT_LENGTH
  );
};

const isMeaningfulPageText = (text) => {
  const cleaned =
    normalizeText(text);

  if (!cleaned) {
    return false;
  }

  const letters =
    cleaned.match(/[a-zA-Z]/g) || [];

  return (
    cleaned.length >=
      MIN_PAGE_TEXT_LENGTH &&
    letters.length >= 5
  );
};

/* ============================================================
   NODE CANVAS FACTORY
============================================================ */

class NodeCanvasFactory {
  create(width, height) {
    const canvas = createCanvas(
      Math.ceil(width),
      Math.ceil(height)
    );

    const context =
      canvas.getContext("2d");

    return {
      canvas,
      context,
    };
  }

  reset(
    canvasAndContext,
    width,
    height
  ) {
    if (!canvasAndContext) {
      return;
    }

    canvasAndContext.canvas.width =
      Math.ceil(width);

    canvasAndContext.canvas.height =
      Math.ceil(height);
  }

  destroy(canvasAndContext) {
    if (!canvasAndContext) {
      return;
    }

    canvasAndContext.canvas.width = 1;
    canvasAndContext.canvas.height = 1;

    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
}

/* ============================================================
   RENDER PDF PAGE
============================================================ */

const renderPdfPage = async (
  pdfDocument,
  pageNumber
) => {
  const page =
    await pdfDocument.getPage(
      pageNumber
    );

  const viewport =
    page.getViewport({
      scale: PDF_RENDER_SCALE,
    });

  const canvasFactory =
    new NodeCanvasFactory();

  const {
    canvas,
    context,
  } = canvasFactory.create(
    viewport.width,
    viewport.height
  );

  /*
   * White background.
   */
  context.save();

  context.fillStyle = "#ffffff";

  context.fillRect(
    0,
    0,
    viewport.width,
    viewport.height
  );

  context.restore();

  console.log("Before PDF page.render()");

await page.render({
  canvasContext: context,
  viewport,
  canvasFactory,
}).promise;

console.log("After PDF page.render()");

  const png =
    canvas.toBuffer("image/png");

  canvasFactory.destroy({
    canvas,
    context,
  });

  return png;
};

/* ============================================================
   IMAGE PREPROCESSING
============================================================ */

/*
 * Convert image to grayscale and increase contrast.
 *
 * This often makes scanned university PDFs much easier
 * for Tesseract to recognize.
 */

const preprocessImage = (
  imageBuffer
) => {
  const imageCanvas =
    createCanvas(1, 1);

  const imageContext =
    imageCanvas.getContext("2d");

  /*
   * canvas.loadImage is asynchronous,
   * so this function is replaced below.
   */

  return imageBuffer;
};

/* ============================================================
   TESSERACT OCR
============================================================ */

const recognizeWithTesseract = async (
  worker,
  imageBuffer,
  pageNumber
) => {
  console.log(
    `\n🔎 Starting OCR for page ${pageNumber}`
  );

  const modes = [
    {
      name: "PSM 6",
      value: "6",
    },
    {
      name: "PSM 3",
      value: "3",
    },
    {
      name: "PSM 4",
      value: "4",
    },
    {
      name: "PSM 11",
      value: "11",
    },
  ];

  let bestText = "";

  let bestConfidence = 0;

  let bestMode = "";

  for (const mode of modes) {
    try {
      console.log(
        `Trying ${mode.name}...`
      );

      await worker.setParameters({
        tessedit_pageseg_mode:
          mode.value,

        preserve_interword_spaces:
          "1",

        user_defined_dpi:
          "300",
      });

      const result =
        await worker.recognize(
          imageBuffer
        );

      const text =
        normalizeText(
          result?.data?.text || ""
        );

      const confidence =
        Number(
          result?.data?.confidence || 0
        );

      console.log(
        `${mode.name}: text=${text.length}, confidence=${confidence.toFixed(
          2
        )}`
      );

      if (
        text.length >
        bestText.length
      ) {
        bestText = text;

        bestConfidence =
          confidence;

        bestMode =
          mode.name;
      }
    } catch (error) {
      console.error(
        `${mode.name} failed:`,
        error?.message
      );
    }
  }

  console.log(
    `Best OCR result for page ${pageNumber}: ${bestMode}`
  );

  console.log(
    `Best confidence: ${bestConfidence.toFixed(
      2
    )}`
  );

  console.log(
    `Best text length: ${bestText.length}`
  );

  if (
    isMeaningfulPageText(
      bestText
    )
  ) {
    return {
      text: bestText,
      confidence: bestConfidence,
      mode: bestMode,
    };
  }

  return {
    text: "",
    confidence: bestConfidence,
    mode: bestMode,
  };
};

/* ============================================================
   COMPLETE OCR
============================================================ */

const extractTextUsingOCR = async (
  absolutePath
) => {
  let worker = null;
  let pdfDocument = null;

  try {
    console.log("");
    console.log(
      "================================================"
    );

    console.log(
      "STARTING TESSERACT PDF OCR"
    );

    console.log(
      "================================================"
    );

    const pdfBuffer =
      await fs.readFile(
        absolutePath
      );

    if (!pdfBuffer.length) {
      throw new ApiError(
        400,
        "PDF file is empty."
      );
    }

    console.log(
      "PDF size:",
      pdfBuffer.length,
      "bytes"
    );

    /*
     * ----------------------------------------------------------
     * LOAD PDF
     * ----------------------------------------------------------
     */

    const loadingTask =
      pdfjsLib.getDocument({
        data: new Uint8Array(
          pdfBuffer
        ),

        useWorkerFetch: false,

        isEvalSupported: false,

        disableFontFace: false,

        verbosity: 0,
      });

    pdfDocument =
      await loadingTask.promise;

    console.log(
      "PDF pages:",
      pdfDocument.numPages
    );

    /*
     * ----------------------------------------------------------
     * CREATE TESSERACT WORKER
     * ----------------------------------------------------------
     */

    console.log(
      "Creating Tesseract worker..."
    );

    worker =
      await createWorker(
        OCR_LANGUAGE,
        1,
        {
          logger: (message) => {
            if (
              message?.status ===
              "recognizing text"
            ) {
              const percent =
                Math.round(
                  Number(
                    message.progress || 0
                  ) * 100
                );

              process.stdout.write(
                `\rOCR progress: ${percent}%`
              );
            }
          },
        }
      );

    console.log(
      "\nTesseract worker ready."
    );

    /*
     * ----------------------------------------------------------
     * PROCESS PAGES
     * ----------------------------------------------------------
     */

    const pageTexts = [];

    let readablePages = 0;

    for (
      let pageNumber = 1;
      pageNumber <=
      pdfDocument.numPages;
      pageNumber++
    ) {
      console.log("");
      console.log(
        `========== PAGE ${pageNumber}/${pdfDocument.numPages} ==========`
      );

      try {
        /*
         * RENDER
         */

        console.log(
          "Rendering page..."
        );

        const imageBuffer =
          await renderPdfPage(
            pdfDocument,
            pageNumber
          );

        console.log(
          "Rendered image size:",
          imageBuffer.length,
          "bytes"
        );

        /*
         * OCR
         */

        const result =
          await recognizeWithTesseract(
            worker,
            imageBuffer,
            pageNumber
          );

        /*
         * ONLY save actual text.
         */

        if (
          result.text &&
          isMeaningfulPageText(
            result.text
          )
        ) {
          readablePages++;

          pageTexts.push(
            `--- Page ${pageNumber} ---\n${result.text}`
          );

          console.log(
            `✅ Page ${pageNumber} successfully extracted.`
          );
        } else {
          console.log(
            `❌ Page ${pageNumber} produced no readable text.`
          );
        }
      } catch (error) {
        console.error(
          `❌ Page ${pageNumber} error:`,
          error?.message
        );
      }
    }

    /*
     * ----------------------------------------------------------
     * FINAL TEXT
     * ----------------------------------------------------------
     */

    const finalText =
      cleanExtractedText(
        pageTexts.join(
          "\n\n"
        )
      );

    console.log("");

    console.log(
      "================================================"
    );

    console.log(
      "OCR RESULT"
    );

    console.log(
      "================================================"
    );

    console.log(
      "Total PDF pages:",
      pdfDocument.numPages
    );

    console.log(
      "Readable pages:",
      readablePages
    );

    console.log(
      "Final text length:",
      finalText.length
    );

    console.log(
      "================================================"
    );

    console.log(
      finalText.substring(
        0,
        3000
      )
    );

    /*
     * ----------------------------------------------------------
     * STRICT SUCCESS CHECK
     * ----------------------------------------------------------
     */

    if (
      readablePages === 0
    ) {
      throw new ApiError(
        400,
        "OCR could not extract readable text from any page of the syllabus PDF."
      );
    }

    if (
      !isMeaningfulText(
        finalText
      )
    ) {
      throw new ApiError(
        400,
        "OCR extracted insufficient readable text from the syllabus PDF."
      );
    }

    console.log(
      "✅ OCR SUCCESS"
    );

    return finalText;
  } finally {
    /*
     * TESSERACT CLEANUP
     */

    if (worker) {
      try {
        await worker.terminate();

        console.log(
          "Tesseract worker terminated."
        );
      } catch (error) {
        console.error(
          "Tesseract cleanup error:",
          error?.message
        );
      }
    }

    /*
     * PDF CLEANUP
     */

    if (pdfDocument) {
      try {
        await pdfDocument.destroy();

        console.log(
          "PDF document destroyed."
        );
      } catch (error) {
        console.error(
          "PDF cleanup error:",
          error?.message
        );
      }
    }
  }
};

/* ============================================================
   NATIVE PDF TEXT EXTRACTION
============================================================ */

const extractNativePdfText = async (
  absolutePath
) => {
  let parser = null;

  try {
    console.log("");
    console.log(
      "================================================"
    );

    console.log(
      "STEP 1: NATIVE PDF TEXT EXTRACTION"
    );

    console.log(
      "================================================"
    );

    const pdfBuffer =
      await fs.readFile(
        absolutePath
      );

    if (!pdfBuffer.length) {
      throw new ApiError(
        400,
        "PDF file is empty."
      );
    }

    parser =
      new PDFParse({
        data: pdfBuffer,
      });

    const result =
      await parser.getText();

    const text =
      cleanExtractedText(
        result?.text || ""
      );

    console.log(
      "Native extracted text length:",
      text.length
    );

    console.log(
      "Native text preview:"
    );

    console.log(
      text.substring(
        0,
        1000
      )
    );

    if (
      isMeaningfulText(text)
    ) {
      console.log(
        "✅ Native extraction successful."
      );

      return text;
    }

    console.log(
      "Native PDF has no usable text."
    );

    return "";
  } catch (error) {
    console.error(
      "Native PDF extraction error:",
      error?.message
    );

    return "";
  } finally {
    if (parser) {
      try {
        await parser.destroy();
      } catch {
        // Ignore.
      }
    }
  }
};

/* ============================================================
   UPLOAD SYLLABUS
============================================================ */

const uploadSyllabus = async ({
  courseOfferingId,
  userEmail,
  file,
}) => {
  if (!file) {
    throw new ApiError(
      400,
      "Syllabus PDF file is required."
    );
  }

  const faculty =
    await Faculty.findOne({
      where: {
        email: userEmail,
        status: true,
      },
    });

  if (!faculty) {
    throw new ApiError(
      404,
      "Approved Faculty profile not found."
    );
  }

  const courseOffering =
    await CourseOffering.findByPk(
      courseOfferingId
    );

  if (!courseOffering) {
    throw new ApiError(
      404,
      "Course Offering not found."
    );
  }

  const assignment =
    await FacultyAssignment.findOne({
      where: {
        facultyId: faculty.id,
        courseOfferingId,
        status: true,
      },
    });

  if (!assignment) {
    throw new ApiError(
      403,
      "You are not assigned to this Course Offering."
    );
  }

  const extension =
    path
      .extname(
        file.originalname
      )
      .toLowerCase();

  if (extension !== ".pdf") {
    throw new ApiError(
      400,
      "Only PDF syllabus files are allowed."
    );
  }

  const uploadDirectory =
    path.join(
      process.cwd(),
      "uploads",
      "syllabi"
    );

  await fs.mkdir(
    uploadDirectory,
    {
      recursive: true,
    }
  );

  const storedFileName =
    `${courseOfferingId}-${Date.now()}-${crypto.randomUUID()}.pdf`;

  const finalPath =
    path.join(
      uploadDirectory,
      storedFileName
    );

  await fs.rename(
    file.path,
    finalPath
  );

  try {
    const syllabus =
      await Syllabus.create({
        courseOfferingId,

        fileName:
          file.originalname,

        filePath:
          path.relative(
            process.cwd(),
            finalPath
          ),

        extractedText:
          null,

        analysisStatus:
          "UPLOADED",

        uploadedBy:
          faculty.id,

        uploadedAt:
          new Date(),
      });

    return syllabus;
  } catch (error) {
    try {
      await fs.unlink(
        finalPath
      );
    } catch {
      // Ignore.
    }

    throw error;
  }
};

/* ============================================================
   EXTRACT SYLLABUS TEXT
============================================================ */

const extractSyllabusText = async (
  syllabusId,
  userEmail
) => {
  /*
   * ----------------------------------------------------------
   * FIND SYLLABUS
   * ----------------------------------------------------------
   */

  const syllabus =
    await Syllabus.findByPk(
      syllabusId
    );

  if (!syllabus) {
    throw new ApiError(
      404,
      "Syllabus not found."
    );
  }

  /*
   * ----------------------------------------------------------
   * FIND FACULTY
   * ----------------------------------------------------------
   */

  const faculty =
    await Faculty.findOne({
      where: {
        email: userEmail,
        status: true,
      },
    });

  if (!faculty) {
    throw new ApiError(
      404,
      "Approved Faculty profile not found."
    );
  }

  /*
   * ----------------------------------------------------------
   * CHECK ASSIGNMENT
   * ----------------------------------------------------------
   */

  const assignment =
    await FacultyAssignment.findOne({
      where: {
        facultyId: faculty.id,

        courseOfferingId:
          syllabus.courseOfferingId,

        status: true,
      },
    });

  if (!assignment) {
    throw new ApiError(
      403,
      "You are not assigned to this Course Offering."
    );
  }

  /*
   * ----------------------------------------------------------
   * PDF PATH
   * ----------------------------------------------------------
   */

  const absolutePath =
    path.resolve(
      process.cwd(),
      syllabus.filePath
    );

  console.log("");
  console.log(
    "================================================"
  );

  console.log(
    "SYLLABUS EXTRACTION"
  );

  console.log(
    "================================================"
  );

  console.log(
    "Syllabus ID:",
    syllabusId
  );

  console.log(
    "Stored path:",
    syllabus.filePath
  );

  console.log(
    "Absolute path:",
    absolutePath
  );

  /*
   * ----------------------------------------------------------
   * CHECK FILE
   * ----------------------------------------------------------
   */

  try {
    await fs.access(
      absolutePath
    );
  } catch {
    throw new ApiError(
      404,
      "Syllabus PDF file not found on the server."
    );
  }

  /*
   * ----------------------------------------------------------
   * MARK EXTRACTING
   * ----------------------------------------------------------
   */

  await Syllabus.update(
    {
      analysisStatus:
        "EXTRACTING",
    },
    {
      where: {
        id: syllabusId,
      },
    }
  );

  try {
    let extractedText = "";

    /*
     * --------------------------------------------------------
     * FIRST: NATIVE TEXT
     * --------------------------------------------------------
     */

    extractedText =
      await extractNativePdfText(
        absolutePath
      );

    /*
     * --------------------------------------------------------
     * SECOND: OCR
     * --------------------------------------------------------
     */

    if (
      !isMeaningfulText(
        extractedText
      )
    ) {
      console.log("");

      console.log(
        "STEP 2: Starting OCR..."
      );

      extractedText =
        await extractTextUsingOCR(
          absolutePath
        );
    }

    /*
     * --------------------------------------------------------
     * FINAL CLEANING
     * --------------------------------------------------------
     */

    extractedText =
      cleanExtractedText(
        extractedText
      );

    /*
     * --------------------------------------------------------
     * FINAL VALIDATION
     * --------------------------------------------------------
     */

    if (
      !isMeaningfulText(
        extractedText
      )
    ) {
      await Syllabus.update(
        {
          analysisStatus:
            "FAILED",

          extractedText:
            null,
        },
        {
          where: {
            id: syllabusId,
          },
        }
      );

      throw new ApiError(
        400,
        "OCR could not extract readable text from the syllabus PDF."
      );
    }

    /*
     * --------------------------------------------------------
     * SAVE
     * --------------------------------------------------------
     */

    await Syllabus.update(
      {
        extractedText,

        analysisStatus:
          "EXTRACTED",
      },
      {
        where: {
          id: syllabusId,
        },
      }
    );

    console.log("");

    console.log(
      "================================================"
    );

    console.log(
      "✅ SYLLABUS EXTRACTION SUCCESSFUL"
    );

    console.log(
      "================================================"
    );

    console.log(
      "Final text length:",
      extractedText.length
    );

    console.log(
      extractedText.substring(
        0,
        2000
      )
    );

    /*
     * --------------------------------------------------------
     * RETURN
     * --------------------------------------------------------
     */

    return await Syllabus.findByPk(
      syllabusId
    );
  } catch (error) {
    /*
     * NEVER replace ApiError with generic 500.
     */

    if (
      error instanceof ApiError
    ) {
      throw error;
    }

    try {
      await Syllabus.update(
        {
          analysisStatus:
            "FAILED",

          extractedText:
            null,
        },
        {
          where: {
            id: syllabusId,
          },
        }
      );
    } catch {
      // Ignore.
    }

    console.error(
      "Syllabus extraction error:",
      error
    );

    throw new ApiError(
      500,
      error?.message ||
        "Failed to extract syllabus text."
    );
  }
};

/* ============================================================
   GET SYLLABUS WITH COURSE
============================================================ */

const getSyllabusWithCourse = async (
  syllabusId,
  userEmail
) => {
  const syllabus =
    await Syllabus.findByPk(
      syllabusId
    );

  if (!syllabus) {
    throw new ApiError(
      404,
      "Syllabus not found."
    );
  }

  const faculty =
    await Faculty.findOne({
      where: {
        email: userEmail,
        status: true,
      },
    });

  if (!faculty) {
    throw new ApiError(
      404,
      "Approved Faculty profile not found."
    );
  }

  const assignment =
    await FacultyAssignment.findOne({
      where: {
        facultyId: faculty.id,

        courseOfferingId:
          syllabus.courseOfferingId,

        status: true,
      },
    });

  if (!assignment) {
    throw new ApiError(
      403,
      "You are not assigned to this Course Offering."
    );
  }

  const courseOffering =
    await CourseOffering.findByPk(
      syllabus.courseOfferingId
    );

  if (!courseOffering) {
    throw new ApiError(
      404,
      "Course Offering not found for this syllabus."
    );
  }

  const course =
    await Course.findByPk(
      courseOffering.courseId
    );

  if (!course) {
    throw new ApiError(
      404,
      "Course not found for this Course Offering."
    );
  }

  return {
    syllabus,
    courseOffering,
    course,
  };
};

/* ============================================================
   EXPORT
============================================================ */

export default {
  uploadSyllabus,
  extractSyllabusText,
  getSyllabusWithCourse,
};