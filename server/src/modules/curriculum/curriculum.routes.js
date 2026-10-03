import { Router } from "express";

import multer from "multer";

import controller from "./curriculum.controller.js";

import authenticate from "../../middleware/auth.middleware.js";

import validate from "../../middleware/validate.middleware.js";

import {
  uploadSyllabusSchema,
  extractSyllabusSchema,
} from "./curriculum.schema.js";

const router = Router();

/**
 * ============================================================
 * Multer configuration
 * ============================================================
 */

const upload = multer({
  dest: "uploads/temp/",

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const isPdf =
      file.mimetype === "application/pdf";

    if (!isPdf) {
      return cb(
        new Error(
          "Only PDF syllabus files are allowed."
        )
      );
    }

    cb(null, true);
  },
});

/**
 * ============================================================
 * Upload syllabus
 * ============================================================
 *
 * POST
 * /api/v1/curriculum/upload-syllabus
 *
 * Multipart field:
 * syllabus
 *
 * ============================================================
 */

router.post(
  "/upload-syllabus",
  authenticate,
  upload.single("syllabus"),
  validate(uploadSyllabusSchema),
  controller.uploadSyllabus
);

/**
 * ============================================================
 * Extract syllabus text
 * ============================================================
 *
 * POST
 * /api/v1/curriculum/extract/:syllabusId
 *
 * ============================================================
 */

router.post(
  "/extract/:syllabusId",
  authenticate,
  validate(extractSyllabusSchema),
  controller.extractSyllabusText
);

/**
 * ============================================================
 * Analyze syllabus using Gemini AI
 * ============================================================
 *
 * POST
 * /api/v1/curriculum/analyze/:syllabusId
 *
 * No request body required.
 *
 * The endpoint uses:
 *
 * Syllabus
 *    ↓
 * extractedText
 *    ↓
 * Gemini AI
 *    ↓
 * Structured syllabus skills/topics
 *
 * ============================================================
 */

router.post(
  "/analyze/:syllabusId",
  authenticate,
  controller.analyzeSyllabus
);
router.post(
  "/industry-discovery/:syllabusId",
  authenticate,
  controller.discoverIndustrySkills
);
router.post(
  "/gap-analysis/:syllabusId",
  authenticate,
  controller.analyzeCurriculumGaps
);

export default router;