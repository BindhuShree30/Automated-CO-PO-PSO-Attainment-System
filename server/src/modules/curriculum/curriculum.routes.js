import { Router } from "express";
import multer from "multer";

import controller from "./curriculum.controller.js";
import authenticate from "../../middleware/auth.middleware.js";

const router = Router();

// Configure multer with memory storage (safe on all OS platforms)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB
  },
  fileFilter: (req, file, cb) => {
    const isPdf =
      file.mimetype === "application/pdf" ||
      file.originalname.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return cb(new Error("Only PDF syllabus files are allowed."));
    }
    cb(null, true);
  },
});

/**
 * Health check for this sub-router
 * GET /api/v1/curriculum/ping
 */
router.get("/ping", (req, res) => {
  res.json({ success: true, message: "Curriculum router is live!" });
});

/**
 * 1. Upload syllabus PDF
 * POST /api/v1/curriculum/upload-syllabus
 */
router.post(
  "/upload-syllabus",
  authenticate,
  upload.single("syllabus"),
  controller.uploadSyllabus
);

/**
 * 2. Extract text from PDF
 * POST /api/v1/curriculum/extract/:syllabusId
 */
router.post(
  "/extract/:syllabusId",
  authenticate,
  controller.extractSyllabusText
);

/**
 * 3. Analyze syllabus using Gemini AI
 * POST /api/v1/curriculum/analyze/:syllabusId
 */
router.post(
  "/analyze/:syllabusId",
  authenticate,
  controller.analyzeSyllabus
);

/**
 * 4. Discover industry skills
 * POST /api/v1/curriculum/industry-discovery/:syllabusId
 */
router.post(
  "/industry-discovery/:syllabusId",
  authenticate,
  controller.discoverIndustrySkills
);

/**
 * 5. Run curriculum gap analysis
 * POST /api/v1/curriculum/gap-analysis/:syllabusId
 */
router.post(
  "/gap-analysis/:syllabusId",
  authenticate,
  upload.single("industryPdf"),
  controller.analyzeCurriculumGaps
);

export default router;