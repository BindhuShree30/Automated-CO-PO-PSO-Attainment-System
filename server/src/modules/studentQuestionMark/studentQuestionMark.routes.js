import { Router } from "express";
import studentQuestionMarkController from "./studentQuestionMark.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import roleMiddleware from "../../middleware/role.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import ROLES from "../../shared/constants/roles.js";

import {
  createStudentQuestionMarkSchema,
  updateStudentQuestionMarkSchema,
  assessmentStudentMarksSchema,
  bulkStudentMarksSchema,
} from "./studentQuestionMark.schema.js";

const router = Router();

/**
 * ================================================================
 * MARKS ENTRY
 * ================================================================
 */

/**
 * Get marks for one Student in one Assessment
 *
 * GET
 * /api/v1/student-question-marks/assessment/:assessmentId/student/:studentId
 */
router.get(
  "/assessment/:assessmentId/student/:studentId",
  authMiddleware,
  validate(assessmentStudentMarksSchema),
  studentQuestionMarkController.getMarksByAssessmentAndStudent
);

/**
 * Save all marks for one Student in one Assessment
 *
 * POST
 * /api/v1/student-question-marks/assessment/:assessmentId/student/:studentId/bulk
 */
router.post(
  "/assessment/:assessmentId/student/:studentId/bulk",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.FACULTY),
  validate(bulkStudentMarksSchema),
  studentQuestionMarkController.saveBulkStudentMarks
);

/**
 * ================================================================
 * EXISTING CRUD
 * ================================================================
 */

/**
 * Create one mark
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.FACULTY),
  validate(createStudentQuestionMarkSchema),
  studentQuestionMarkController.createStudentQuestionMark
);

/**
 * Get all marks
 */
router.get(
  "/",
  authMiddleware,
  studentQuestionMarkController.getStudentQuestionMarks
);

/**
 * Get marks by Student
 */
router.get(
  "/student/:studentId",
  authMiddleware,
  studentQuestionMarkController.getMarksByStudentId
);

/**
 * Get marks by Assessment Question
 */
router.get(
  "/question/:assessmentQuestionId",
  authMiddleware,
  studentQuestionMarkController.getMarksByAssessmentQuestionId
);

/**
 * Get mark by ID
 */
router.get(
  "/:id",
  authMiddleware,
  studentQuestionMarkController.getStudentQuestionMarkById
);

/**
 * Update one mark
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.FACULTY),
  validate(updateStudentQuestionMarkSchema),
  studentQuestionMarkController.updateStudentQuestionMark
);

/**
 * Delete one mark
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(updateStudentQuestionMarkSchema),
  studentQuestionMarkController.deleteStudentQuestionMark
);

export default router;