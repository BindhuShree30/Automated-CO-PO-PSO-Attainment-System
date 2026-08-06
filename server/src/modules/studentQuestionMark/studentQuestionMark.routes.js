/**
 * ------------------------------------------------------------------
 * Student Question Mark Routes
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { Router } from "express";

import studentQuestionMarkController from "./studentQuestionMark.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import roleMiddleware from "../../middleware/role.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import ROLES from "../../shared/constants/roles.js";

import {
  createStudentQuestionMarkSchema,
  updateStudentQuestionMarkSchema,
} from "./studentQuestionMark.schema.js";

const router = Router();

/**
 * Create Student Question Mark
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(createStudentQuestionMarkSchema),
  studentQuestionMarkController.createStudentQuestionMark
);

/**
 * Get All Student Question Marks
 */
router.get(
  "/",
  authMiddleware,
  studentQuestionMarkController.getStudentQuestionMarks
);

/**
 * Get Marks By Student
 */
router.get(
  "/student/:studentId",
  authMiddleware,
  studentQuestionMarkController.getMarksByStudentId
);

/**
 * Get Marks By Assessment Question
 */
router.get(
  "/question/:assessmentQuestionId",
  authMiddleware,
  studentQuestionMarkController.getMarksByAssessmentQuestionId
);

/**
 * Get Student Question Mark By ID
 *
 * IMPORTANT:
 * Keep /:id after /student/:studentId and
 * /question/:assessmentQuestionId.
 */
router.get(
  "/:id",
  authMiddleware,
  studentQuestionMarkController.getStudentQuestionMarkById
);

/**
 * Update Student Question Mark
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(updateStudentQuestionMarkSchema),
  studentQuestionMarkController.updateStudentQuestionMark
);

/**
 * Delete Student Question Mark
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  studentQuestionMarkController.deleteStudentQuestionMark
);

export default router;