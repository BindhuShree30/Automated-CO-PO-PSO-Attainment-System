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
const PDF_RENDER_SCALE = 3;
const MIN_DOCUMENT_TEXT_LENGTH = 40;
const MIN_PAGE_TEXT_LENGTH = 10;

/* ============================================================
   TEXT CLEANING
============================================================ */

const normalizeText = (text) => {
  if (!text) return "";
  return String(text)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const cleanExtractedText = (text) => {
  if (!text) return "";
  return normalizeText(text)
    .replace(/---\s*Page\s+\d+\s*---/gi, "")
    .replace(/\[UNREADABLE PAGE\]/gi, "")
    .replace(/\[UNREADABLE\]/gi, "")
    .trim();
};

/* ============================================================
   VALIDATION
============================================================ */

const isMeaningfulText = (text) => {
  const cleaned = cleanExtractedText(text);
  if (!cleaned) return false;
  const alphanumeric = cleaned.replace(/[^a-zA-Z0-9]/g, "");
  return alphanumeric.length >= MIN_DOCUMENT_TEXT_LENGTH;
};

const isMeaningfulPageText = (text) => {
  const cleaned = normalizeText(text);
  if (!cleaned) return false;
  const letters = cleaned.match(/[a-zA-Z]/g) || [];
  return cleaned.length >= MIN_PAGE_TEXT_LENGTH && letters.length >= 5;
};

/* ============================================================
   NODE CANVAS FACTORY
============================================================ */

class NodeCanvasFactory {
  create(width, height) {
    const canvas = createCanvas(Math.ceil(width), Math.ceil(height));
    const context = canvas.getContext("2d");
    return { canvas, context };
  }

  reset(canvasAndContext, width, height) {
    if (!canvasAndContext) return;
    canvasAndContext.canvas.width = Math.ceil(width);
    canvasAndContext.canvas.height = Math.ceil(height);
  }

  destroy(canvasAndContext) {
    if (!canvasAndContext) return;
    canvasAndContext.canvas.width = 1;
    canvasAndContext.canvas.height = 1;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
}

/* ============================================================
   RENDER PDF PAGE
============================================================ */

const renderPdfPage = async (pdfDocument, pageNumber) => {
  const page = await pdfDocument.getPage(pageNumber);
  const viewport = page.getViewport({ scale: PDF_RENDER_SCALE });
  const canvasFactory = new NodeCanvasFactory();
  const { canvas, context } = canvasFactory.create(
    viewport.width,
    viewport.height
  );

  context.save();
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, viewport.width, viewport.height);
  context.restore();

  await page.render({
    canvasContext: context,
    viewport,
    canvasFactory,
  }).promise;

  const png = canvas.toBuffer("image/png");
  canvasFactory.destroy({ canvas, context });
  return png;
};

/* ============================================================
   TESSERACT OCR
============================================================ */

const recognizeWithTesseract = async (worker, imageBuffer, pageNumber) => {
  const modes = [
    { name: "PSM 6", value: "6" },
    { name: "PSM 3", value: "3" },
    { name: "PSM 4", value: "4" },
    { name: "PSM 11", value: "11" },
  ];

  let bestText = "";
  let bestConfidence = 0;
  let bestMode = "";

  for (const mode of modes) {
    try {
      await worker.setParameters({
        tessedit_pageseg_mode: mode.value,
        preserve_interword_spaces: "1",
        user_defined_dpi: "300",
      });

      const result = await worker.recognize(imageBuffer);
      const text = normalizeText(result?.data?.text || "");
      const confidence = Number(result?.data?.confidence || 0);

      if (text.length > bestText.length) {
        bestText = text;
        bestConfidence = confidence;
        bestMode = mode.name;
      }
    } catch (error) {
      console.error(`${mode.name} failed:`, error?.message);
    }
  }

  if (isMeaningfulPageText(bestText)) {
    return { text: bestText, confidence: bestConfidence, mode: bestMode };
  }

  return { text: "", confidence: bestConfidence, mode: bestMode };
};

/* ============================================================
   COMPLETE OCR
============================================================ */

const extractTextUsingOCR = async (absolutePath) => {
  let worker = null;
  let pdfDocument = null;

  try {
    const pdfBuffer = await fs.readFile(absolutePath);
    if (!pdfBuffer.length) {
      throw new ApiError(400, "PDF file is empty.");
    }

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfBuffer),
      useWorkerFetch: false,
      isEvalSupported: false,
      disableFontFace: false,
      verbosity: 0,
    });

    pdfDocument = await loadingTask.promise;

    worker = await createWorker(OCR_LANGUAGE, 1, {
      logger: () => {},
    });

    const pageTexts = [];
    let readablePages = 0;

    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
      try {
        const imageBuffer = await renderPdfPage(pdfDocument, pageNumber);
        const result = await recognizeWithTesseract(worker, imageBuffer, pageNumber);

        if (result.text && isMeaningfulPageText(result.text)) {
          readablePages++;
          pageTexts.push(`--- Page ${pageNumber} ---\n${result.text}`);
        }
      } catch (error) {
        console.error(`Page ${pageNumber} OCR error:`, error?.message);
      }
    }

    const finalText = cleanExtractedText(pageTexts.join("\n\n"));

    if (readablePages === 0 || !isMeaningfulText(finalText)) {
      throw new ApiError(
        400,
        "OCR could not extract readable text from the syllabus PDF."
      );
    }

    return finalText;
  } finally {
    if (worker) {
      try { await worker.terminate(); } catch {}
    }
    if (pdfDocument) {
      try { await pdfDocument.destroy(); } catch {}
    }
  }
};

/* ============================================================
   NATIVE PDF TEXT EXTRACTION
============================================================ */

const extractNativePdfText = async (absolutePath) => {
  let parser = null;
  try {
    const pdfBuffer = await fs.readFile(absolutePath);
    if (!pdfBuffer.length) {
      throw new ApiError(400, "PDF file is empty.");
    }

    parser = new PDFParse({ data: pdfBuffer });
    const result = await parser.getText();
    const text = cleanExtractedText(result?.text || "");

    if (isMeaningfulText(text)) {
      return text;
    }
    return "";
  } catch (error) {
    console.error("Native PDF extraction fallback:", error?.message);
    return "";
  } finally {
    if (parser) {
      try { await parser.destroy(); } catch {}
    }
  }
};

/* ============================================================
   HELPER: VERIFY FACULTY ASSIGNMENT
============================================================ */

const verifyFacultyAssignment = async (facultyId, courseOfferingId) => {
  const courseOffering = await CourseOffering.findByPk(courseOfferingId);
  if (!courseOffering) {
    throw new ApiError(404, "Course Offering not found.");
  }

  // Check 1: Direct assignment on course_offerings table
  const isDirectlyAssigned = courseOffering.facultyId === facultyId;

  // Check 2: Row in faculty_assignments table
  const assignment = await FacultyAssignment.findOne({
    where: {
      facultyId,
      courseOfferingId,
      status: true,
    },
  });

  if (!isDirectlyAssigned && !assignment) {
    throw new ApiError(
      403,
      "You are not assigned to this Course Offering."
    );
  }

  return courseOffering;
};

/* ============================================================
   UPLOAD SYLLABUS
============================================================ */

const uploadSyllabus = async ({ courseOfferingId, userEmail, file }) => {
  if (!file) {
    throw new ApiError(400, "Syllabus PDF file is required.");
  }

  const faculty = await Faculty.findOne({
    where: {
      email: userEmail,
      status: true,
    },
  });

  if (!faculty) {
    throw new ApiError(404, "Approved Faculty profile not found.");
  }

  // Uses dual check: course_offerings.faculty_id OR faculty_assignments
  const courseOffering = await verifyFacultyAssignment(faculty.id, courseOfferingId);

  const extension = path.extname(file.originalname).toLowerCase();
  if (extension !== ".pdf") {
    throw new ApiError(400, "Only PDF syllabus files are allowed.");
  }

  const uploadDirectory = path.join(process.cwd(), "uploads", "syllabi");
  await fs.mkdir(uploadDirectory, { recursive: true });

  const storedFileName = `${courseOfferingId}-${Date.now()}-${crypto.randomUUID()}.pdf`;
  const finalPath = path.join(uploadDirectory, storedFileName);

  // Supports both diskStorage (file.path) and memoryStorage (file.buffer)
  if (file.buffer) {
    await fs.writeFile(finalPath, file.buffer);
  } else if (file.path) {
    await fs.rename(file.path, finalPath);
  } else {
    throw new ApiError(400, "Uploaded file content is unreadable.");
  }

  try {
    const syllabus = await Syllabus.create({
      courseOfferingId,
      fileName: file.originalname,
      filePath: path.relative(process.cwd(), finalPath),
      extractedText: null,
      analysisStatus: "UPLOADED",
      uploadedBy: faculty.id,
      uploadedAt: new Date(),
    });

    return syllabus;
  } catch (error) {
    try {
      await fs.unlink(finalPath);
    } catch {}
    throw error;
  }
};

/* ============================================================
   EXTRACT SYLLABUS TEXT
============================================================ */

const extractSyllabusText = async (syllabusId, userEmail) => {
  const syllabus = await Syllabus.findByPk(syllabusId);
  if (!syllabus) {
    throw new ApiError(404, "Syllabus not found.");
  }

  const faculty = await Faculty.findOne({
    where: {
      email: userEmail,
      status: true,
    },
  });

  if (!faculty) {
    throw new ApiError(404, "Approved Faculty profile not found.");
  }

  // Dual check
  await verifyFacultyAssignment(faculty.id, syllabus.courseOfferingId);

  const absolutePath = path.resolve(process.cwd(), syllabus.filePath);

  try {
    await fs.access(absolutePath);
  } catch {
    throw new ApiError(404, "Syllabus PDF file not found on the server.");
  }

  await Syllabus.update(
    { analysisStatus: "EXTRACTING" },
    { where: { id: syllabusId } }
  );

  try {
    let extractedText = await extractNativePdfText(absolutePath);

    if (!isMeaningfulText(extractedText)) {
      console.log("Native extraction insufficient, starting OCR...");
      extractedText = await extractTextUsingOCR(absolutePath);
    }

    extractedText = cleanExtractedText(extractedText);

    if (!isMeaningfulText(extractedText)) {
      await Syllabus.update(
        { analysisStatus: "FAILED", extractedText: null },
        { where: { id: syllabusId } }
      );
      throw new ApiError(
        400,
        "Could not extract readable text from the syllabus PDF."
      );
    }

    await Syllabus.update(
      { extractedText, analysisStatus: "EXTRACTED" },
      { where: { id: syllabusId } }
    );

    return await Syllabus.findByPk(syllabusId);
  } catch (error) {
    if (error instanceof ApiError) throw error;

    try {
      await Syllabus.update(
        { analysisStatus: "FAILED", extractedText: null },
        { where: { id: syllabusId } }
      );
    } catch {}

    throw new ApiError(500, error?.message || "Failed to extract syllabus text.");
  }
};

/* ============================================================
   GET SYLLABUS WITH COURSE
============================================================ */

const getSyllabusWithCourse = async (syllabusId, userEmail) => {
  const syllabus = await Syllabus.findByPk(syllabusId);
  if (!syllabus) {
    throw new ApiError(404, "Syllabus not found.");
  }

  const faculty = await Faculty.findOne({
    where: {
      email: userEmail,
      status: true,
    },
  });

  if (!faculty) {
    throw new ApiError(404, "Approved Faculty profile not found.");
  }

  // Dual check
  const courseOffering = await verifyFacultyAssignment(
    faculty.id,
    syllabus.courseOfferingId
  );

  const course = await Course.findByPk(courseOffering.courseId);
  if (!course) {
    throw new ApiError(404, "Course not found for this Course Offering.");
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