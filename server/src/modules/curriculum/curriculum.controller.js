import { createRequire } from "module";

import curriculumService from "./curriculum.service.js";
import curriculumAiService from "./curriculum.ai.service.js";
import industryAiService from "./industry.ai.service.js";
import gapAiService from "./gap.ai.service.js";

const require = createRequire(import.meta.url);

/**
 * 1. Upload Syllabus PDF
 */
export const uploadSyllabus = async (req, res, next) => {
  try {
    const courseOfferingId = req.body?.courseOfferingId;

    if (!courseOfferingId) {
      return res.status(400).json({
        success: false,
        message: "courseOfferingId is required.",
        data: null,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Syllabus PDF file is required (field name: 'syllabus').",
        data: null,
      });
    }

    const userEmail = req.user?.email;
    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user email not found.",
        data: null,
      });
    }

    const syllabus = await curriculumService.uploadSyllabus({
      courseOfferingId,
      userEmail,
      file: req.file,
    });

    return res.status(201).json({
      success: true,
      message: "Syllabus uploaded successfully.",
      data: syllabus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Extract Text from PDF
 */
export const extractSyllabusText = async (req, res, next) => {
  try {
    const { syllabusId } = req.params;
    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user email not found.",
      });
    }

    const syllabus = await curriculumService.extractSyllabusText(
      syllabusId,
      userEmail
    );

    return res.status(200).json({
      success: true,
      message: "Syllabus text extracted successfully.",
      data: syllabus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Analyze Syllabus Structure with Gemini AI
 */
export const analyzeSyllabus = async (req, res, next) => {
  try {
    const { syllabusId } = req.params;
    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user email not found.",
      });
    }

    const { syllabus, courseOffering, course } =
      await curriculumService.getSyllabusWithCourse(syllabusId, userEmail);

    if (
      syllabus.analysisStatus !== "EXTRACTED" &&
      syllabus.analysisStatus !== "FAILED"
    ) {
      return res.status(400).json({
        success: false,
        message: "Syllabus must be extracted before AI analysis.",
        data: {
          syllabusId: syllabus.id,
          analysisStatus: syllabus.analysisStatus,
        },
      });
    }

    if (!syllabus.extractedText?.trim()) {
      return res.status(400).json({
        success: false,
        message: "No extracted syllabus text is available.",
      });
    }

    await syllabus.update({ analysisStatus: "ANALYZING" });

    try {
      const aiResult = await curriculumAiService.extractSyllabusSkills(
        syllabus.extractedText
      );

      await syllabus.update({ analysisStatus: "COMPLETED" });

      return res.status(200).json({
        success: true,
        message: "Syllabus analyzed successfully using Gemini AI.",
        data: {
          syllabus: {
            id: syllabus.id,
            fileName: syllabus.fileName,
            analysisStatus: "COMPLETED",
          },
          course: {
            id: course.id,
            name: course.name,
            code: course.code,
            semester: course.semester,
            credits: course.credits,
          },
          courseOffering: { id: courseOffering.id },
          aiAnalysis: aiResult,
        },
      });
    } catch (error) {
      await syllabus.update({ analysisStatus: "FAILED" });
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Discover Industry Skills
 */
export const discoverIndustrySkills = async (req, res, next) => {
  try {
    const { syllabusId } = req.params;
    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user email not found.",
      });
    }

    const { syllabus, courseOffering, course } =
      await curriculumService.getSyllabusWithCourse(syllabusId, userEmail);

    if (syllabus.analysisStatus !== "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Syllabus must be analyzed before industry skill discovery.",
        data: {
          syllabusId: syllabus.id,
          analysisStatus: syllabus.analysisStatus,
        },
      });
    }

    if (!syllabus.extractedText?.trim()) {
      return res.status(400).json({
        success: false,
        message: "No extracted syllabus text is available.",
      });
    }

    const aiResult = await industryAiService.discoverIndustrySkills(
      syllabus.extractedText
    );

    return res.status(200).json({
      success: true,
      message: "Industry skills discovered successfully.",
      data: {
        syllabus: { id: syllabus.id, fileName: syllabus.fileName },
        course: {
          id: course.id,
          name: course.name,
          code: course.code,
          semester: course.semester,
          credits: course.credits,
        },
        courseOffering: { id: courseOffering.id },
        industryAnalysis: aiResult,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Run Curriculum Gap Analysis
 */
export const analyzeCurriculumGaps = async (req, res, next) => {
  try {
    const { syllabusId } = req.params;
    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user email not found.",
      });
    }

    const { syllabus, courseOffering, course } =
      await curriculumService.getSyllabusWithCourse(syllabusId, userEmail);

    if (syllabus.analysisStatus !== "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Syllabus must be analyzed before curriculum gap analysis.",
        data: {
          syllabusId: syllabus.id,
          analysisStatus: syllabus.analysisStatus,
        },
      });
    }

    if (!syllabus.extractedText?.trim()) {
      return res.status(400).json({
        success: false,
        message: "No extracted syllabus text is available.",
      });
    }

    // 1. Extract syllabus competencies
    const syllabusAnalysis = await curriculumAiService.extractSyllabusSkills(
      syllabus.extractedText
    );

    // 2. Read custom industry input (if uploaded/typed)
    let customIndustryText = req.body?.industryText || "";

    if (req.file) {
      try {
        const pdfParse = require("pdf-parse");
        const parsed = await pdfParse(req.file.buffer);
        customIndustryText = parsed.text || "";
      } catch (err) {
        console.error("Custom industry file parsing error:", err);
      }
    }

    let industryAnalysis;
    if (customIndustryText.trim().length > 20) {
      industryAnalysis = await curriculumAiService.extractSyllabusSkills(
        customIndustryText
      );
    } else {
      industryAnalysis = await industryAiService.discoverIndustrySkills(
        syllabus.extractedText
      );
    }

    // 3. Compare with industry expectations
    const gapAnalysis = await gapAiService.analyzeCurriculumGaps(
      syllabusAnalysis,
      industryAnalysis
    );

    return res.status(200).json({
      success: true,
      message: "Curriculum gap analysis completed successfully.",
      data: {
        syllabus: {
          id: syllabus.id,
          fileName: syllabus.fileName,
          analysisStatus: syllabus.analysisStatus,
        },
        course: {
          id: course.id,
          name: course.name,
          code: course.code,
          semester: course.semester,
          credits: course.credits,
        },
        courseOffering: { id: courseOffering.id },
        syllabusAnalysis,
        industryAnalysis,
        gapAnalysis,
      },
    });
  } catch (error) {
    next(error);
  }
};

const controller = {
  uploadSyllabus,
  extractSyllabusText,
  analyzeSyllabus,
  discoverIndustrySkills,
  analyzeCurriculumGaps,
};

export default controller;