/*
 * ------------------------------------------------------------------
 * Assessment Question Routes
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { Router } from "express";

import multer from "multer";

import assessmentQuestionController from "./assessmentQuestion.controller.js";

import authMiddleware from "../../middleware/auth.middleware.js";

import roleMiddleware from "../../middleware/role.middleware.js";

import validate from "../../middleware/validate.middleware.js";

import ROLES from "../../shared/constants/roles.js";

import {
  createAssessmentQuestionSchema,
  updateAssessmentQuestionSchema,
  assessmentQuestionIdSchema,
  assessmentQuestionsByAssessmentSchema,
} from "./assessmentQuestion.schema.js";

const router = Router();

/**
 * ------------------------------------------------------------------
 * Multer Configuration
 * ------------------------------------------------------------------
 *
 * Supported files:
 * - PDF
 * - Excel (.xlsx)
 * - Excel (.xls)
 * - CSV
 *
 * Files are stored in memory because they are only required
 * temporarily for parsing.
 * ------------------------------------------------------------------
 */

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedExtensions = [
      ".pdf",
      ".xlsx",
      ".xls",
      ".csv",
    ];

    const originalName =
      file.originalname.toLowerCase();

    const lastDotIndex =
      originalName.lastIndexOf(".");

    const extension =
      lastDotIndex !== -1
        ? originalName.slice(lastDotIndex)
        : "";

    if (!allowedExtensions.includes(extension)) {
      return cb(
        new Error(
          "Only PDF, Excel (.xlsx/.xls), and CSV files are allowed."
        )
      );
    }

    cb(null, true);
  },
});

/**
 * ------------------------------------------------------------------
 * Create Question
 * ------------------------------------------------------------------
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(
    ROLES.HOD,
    ROLES.FACULTY
  ),
  validate(
    createAssessmentQuestionSchema
  ),
  assessmentQuestionController
    .createAssessmentQuestion
);

/**
 * ------------------------------------------------------------------
 * Get All Questions
 * ------------------------------------------------------------------
 */
router.get(
  "/",
  authMiddleware,
  assessmentQuestionController
    .getAssessmentQuestions
);

/**
 * ------------------------------------------------------------------
 * Get Questions By Assessment
 * ------------------------------------------------------------------
 *
 * Keep this route before "/:id".
 * ------------------------------------------------------------------
 */
router.get(
  "/assessment/:assessmentId",
  authMiddleware,
  validate(
    assessmentQuestionsByAssessmentSchema
  ),
  assessmentQuestionController
    .getQuestionsByAssessment
);

/**
 * ------------------------------------------------------------------
 * Upload Question Paper - Preview
 * ------------------------------------------------------------------
 *
 * POST
 * /api/v1/assessment-questions/upload-preview
 *
 * form-data:
 *
 * assessmentId -> Text
 * file         -> File
 *
 * Supported:
 * PDF / XLSX / XLS / CSV
 *
 * This does NOT save questions.
 * ------------------------------------------------------------------
 */
router.post(
  "/upload-preview",
  authMiddleware,
  roleMiddleware(
    ROLES.HOD,
    ROLES.FACULTY
  ),
  upload.any(),
  assessmentQuestionController
    .previewAssessmentQuestionsUpload
);

/**
 * ------------------------------------------------------------------
 * Upload Question Paper - Confirm
 * ------------------------------------------------------------------
 */
router.post(
  "/upload-confirm",
  authMiddleware,
  roleMiddleware(
    ROLES.HOD,
    ROLES.FACULTY
  ),
  assessmentQuestionController
    .confirmAssessmentQuestionsUpload
);

/**
 * ------------------------------------------------------------------
 * Get Question By ID
 * ------------------------------------------------------------------
 */
router.get(
  "/:id",
  authMiddleware,
  validate(
    assessmentQuestionIdSchema
  ),
  assessmentQuestionController
    .getAssessmentQuestionById
);

/**
 * ------------------------------------------------------------------
 * Update Question
 * ------------------------------------------------------------------
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(
    ROLES.HOD,
    ROLES.FACULTY
  ),
  validate(
    updateAssessmentQuestionSchema
  ),
  assessmentQuestionController
    .updateAssessmentQuestion
);

/**
 * ------------------------------------------------------------------
 * Delete Question
 * ------------------------------------------------------------------
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(
    ROLES.HOD,
    ROLES.FACULTY
  ),
  validate(
    assessmentQuestionIdSchema
  ),
  assessmentQuestionController
    .deleteAssessmentQuestion
);

export default router;