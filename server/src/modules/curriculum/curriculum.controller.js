import curriculumService from "./curriculum.service.js";
import curriculumAiService from "./curriculum.ai.service.js";
import industryAiService from "./industry.ai.service.js";
import gapAiService from "./gap.ai.service.js";


/**
 * ==============================================================
 * Upload syllabus PDF
 * ==============================================================
 */
const uploadSyllabus = async (req, res, next) => {
  try {
    const { courseOfferingId } = req.validatedData.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Syllabus PDF file is required.",
        data: null,
        error: null,
      });
    }

    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user email not found.",
        data: null,
        error: null,
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
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ==============================================================
 * Extract syllabus PDF text
 * ==============================================================
 */
const extractSyllabusText = async (req, res, next) => {
  try {
    const { syllabusId } = req.validatedData.params;

    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user email not found.",
        data: null,
        error: null,
      });
    }

    const syllabus =
      await curriculumService.extractSyllabusText(
        syllabusId,
        userEmail
      );

    return res.status(200).json({
      success: true,
      message: "Syllabus text extracted successfully.",
      data: syllabus,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ==============================================================
 * Analyze extracted syllabus using Gemini AI
 * ==============================================================
 */
const analyzeSyllabus = async (req, res, next) => {
  try {
    const { syllabusId } = req.params;

    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user email not found.",
        data: null,
        error: null,
      });
    }

    /**
     * ----------------------------------------------------------
     * Get syllabus and verify faculty assignment
     * ----------------------------------------------------------
     */
    const {
      syllabus,
      courseOffering,
      course,
    } = await curriculumService.getSyllabusWithCourse(
      syllabusId,
      userEmail
    );

    /**
     * ----------------------------------------------------------
     * Make sure PDF text extraction is completed
     *
     * EXTRACTED = first-time AI analysis
     * FAILED    = retry after previous AI failure
     *
     * We allow FAILED because the extracted syllabus text
     * is still available in the database.
     * ----------------------------------------------------------
     */
    if (
      syllabus.analysisStatus !== "EXTRACTED" &&
      syllabus.analysisStatus !== "FAILED"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Syllabus must be extracted before AI analysis.",
        data: {
          syllabusId: syllabus.id,
          analysisStatus: syllabus.analysisStatus,
        },
        error: null,
      });
    }

    /**
     * ----------------------------------------------------------
     * Verify extracted text exists
     * ----------------------------------------------------------
     */
    if (!syllabus.extractedText?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "No extracted syllabus text is available.",
        data: null,
        error: null,
      });
    }

    /**
     * ----------------------------------------------------------
     * Mark analysis as running
     * ----------------------------------------------------------
     */
    await syllabus.update({
      analysisStatus: "ANALYZING",
    });

    try {
      /**
       * --------------------------------------------------------
       * Send extracted syllabus text to Gemini
       * --------------------------------------------------------
       */
      const aiResult =
        await curriculumAiService.extractSyllabusSkills(
          syllabus.extractedText
        );

      /**
       * --------------------------------------------------------
       * Mark analysis as completed
       *
       * AI result is intentionally NOT saved to DB yet.
       * This stage is for testing the AI analysis output.
       * --------------------------------------------------------
       */
      await syllabus.update({
        analysisStatus: "COMPLETED",
      });

      return res.status(200).json({
        success: true,
        message:
          "Syllabus analyzed successfully using Gemini AI.",
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

          courseOffering: {
            id: courseOffering.id,
          },

          aiAnalysis: aiResult,
        },
        error: null,
      });
    } catch (error) {
      /**
       * --------------------------------------------------------
       * Gemini analysis failed
       *
       * Keep extractedText in DB so the user can retry.
       * --------------------------------------------------------
       */
      await syllabus.update({
        analysisStatus: "FAILED",
      });

      throw error;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * ==============================================================
 * Discover industry skills using AI
 * ==============================================================
 */
const discoverIndustrySkills = async (req, res, next) => {
  try {
    const { syllabusId } = req.params;

    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user email not found.",
        data: null,
        error: null,
      });
    }

    /**
     * ----------------------------------------------------------
     * Get syllabus and verify faculty assignment
     * ----------------------------------------------------------
     */
    const {
      syllabus,
      courseOffering,
      course,
    } = await curriculumService.getSyllabusWithCourse(
      syllabusId,
      userEmail
    );

    /**
     * ----------------------------------------------------------
     * Industry discovery can only happen after syllabus
     * analysis has completed successfully.
     * ----------------------------------------------------------
     */
    if (syllabus.analysisStatus !== "COMPLETED") {
      return res.status(400).json({
        success: false,
        message:
          "Syllabus must be analyzed before industry skill discovery.",
        data: {
          syllabusId: syllabus.id,
          analysisStatus: syllabus.analysisStatus,
        },
        error: null,
      });
    }

    /**
     * ----------------------------------------------------------
     * Verify extracted text exists
     * ----------------------------------------------------------
     */
    if (!syllabus.extractedText?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "No extracted syllabus text is available.",
        data: null,
        error: null,
      });
    }

    /**
     * ----------------------------------------------------------
     * Discover industry skills
     * ----------------------------------------------------------
     */
    const aiResult =
      await industryAiService.discoverIndustrySkills(
        syllabus.extractedText
      );

    return res.status(200).json({
      success: true,
      message:
        "Industry skills discovered successfully.",
      data: {
        syllabus: {
          id: syllabus.id,
          fileName: syllabus.fileName,
        },

        course: {
          id: course.id,
          name: course.name,
          code: course.code,
          semester: course.semester,
          credits: course.credits,
        },

        courseOffering: {
          id: courseOffering.id,
        },

        industryAnalysis: aiResult,
      },
      error: null,
    });
  } catch (error) {
    next(error);
  }
};
/**
 * ============================================================
 * Analyze Curriculum Gaps
 * ============================================================
 *
 * Requires:
 *
 * 1. Syllabus analysis COMPLETED
 * 2. Industry skill discovery
 *
 * Then:
 *
 * Syllabus Analysis
 *        +
 * Industry Analysis
 *        ↓
 * Curriculum Gap Analysis
 *        ↓
 * Solutions
 * ============================================================
 */

const analyzeCurriculumGaps = async (
  req,
  res,
  next
) => {
  try {
    const { syllabusId } = req.params;

    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message:
          "Authenticated user email not found.",
        data: null,
        error: null,
      });
    }

    /**
     * --------------------------------------------------------
     * Get syllabus + course
     * --------------------------------------------------------
     */

    const {
      syllabus,
      courseOffering,
      course,
    } =
      await curriculumService.getSyllabusWithCourse(
        syllabusId,
        userEmail
      );

    /**
     * --------------------------------------------------------
     * Check syllabus analysis
     * --------------------------------------------------------
     */

    if (
      syllabus.analysisStatus !==
      "COMPLETED"
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Syllabus must be analyzed before curriculum gap analysis.",

        data: {
          syllabusId: syllabus.id,

          analysisStatus:
            syllabus.analysisStatus,
        },

        error: null,
      });
    }

    /**
     * --------------------------------------------------------
     * Check extracted text
     * --------------------------------------------------------
     */

    if (
      !syllabus.extractedText?.trim()
    ) {
      return res.status(400).json({
        success: false,

        message:
          "No extracted syllabus text is available.",

        data: null,

        error: null,
      });
    }

    /**
     * --------------------------------------------------------
     * STEP 1
     *
     * Generate syllabus analysis
     *
     * --------------------------------------------------------
     *
     * IMPORTANT:
     *
     * At this stage we are not storing the result in DB.
     *
     * For production, we should eventually store this JSON.
     */

    const syllabusAnalysis =
      await curriculumAiService.extractSyllabusSkills(
        syllabus.extractedText
      );

    /**
     * --------------------------------------------------------
     * STEP 2
     *
     * Discover industry skills
     * --------------------------------------------------------
     */

    const industryAnalysis =
      await industryAiService.discoverIndustrySkills(
        syllabus.extractedText
      );

    /**
     * --------------------------------------------------------
     * STEP 3
     *
     * Compare syllabus + industry skills
     * --------------------------------------------------------
     */

    const gapAnalysis =
      await gapAiService.analyzeCurriculumGaps(
        syllabusAnalysis,
        industryAnalysis
      );

    /**
     * --------------------------------------------------------
     * Return result
     * --------------------------------------------------------
     */

    return res.status(200).json({
      success: true,

      message:
        "Curriculum gap analysis completed successfully.",

      data: {
        syllabus: {
          id: syllabus.id,

          fileName:
            syllabus.fileName,

          analysisStatus:
            syllabus.analysisStatus,
        },

        course: {
          id: course.id,

          name: course.name,

          code: course.code,

          semester: course.semester,

          credits: course.credits,
        },

        courseOffering: {
          id: courseOffering.id,
        },

        syllabusAnalysis,

        industryAnalysis,

        gapAnalysis,
      },

      error: null,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * ==============================================================
 * Controller exports
 * ==============================================================
 */
export default {
  uploadSyllabus,
  extractSyllabusText,
  analyzeSyllabus,
  discoverIndustrySkills,
  analyzeCurriculumGaps,
};