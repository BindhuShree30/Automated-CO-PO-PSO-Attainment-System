/**
 * ------------------------------------------------------------------
 * Assessment Question Routes
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { Router } from "express";

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
  assessmentQuestionsByCourseOutcomeSchema,
} from "./assessmentQuestion.schema.js";

const router = Router();

/**
 * Create Assessment Question
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(createAssessmentQuestionSchema),
  assessmentQuestionController.createAssessmentQuestion
);

/**
 * Get All Assessment Questions
 */
router.get(
  "/",
  authMiddleware,
  assessmentQuestionController.getAssessmentQuestions
);

/**
 * Get Questions By Assessment
 *
 * IMPORTANT:
 * Keep this route before "/:id".
 */
router.get(
  "/assessment/:assessmentId",
  authMiddleware,
  validate(assessmentQuestionsByAssessmentSchema),
  assessmentQuestionController.getQuestionsByAssessment
);

/**
 * Get Questions By Course Outcome
 *
 * IMPORTANT:
 * Keep this route before "/:id".
 */
router.get(
  "/course-outcome/:courseOutcomeId",
  authMiddleware,
  validate(assessmentQuestionsByCourseOutcomeSchema),
  assessmentQuestionController.getQuestionsByCourseOutcome
);

/**
 * Get Assessment Question By ID
 */
router.get(
  "/:id",
  authMiddleware,
  validate(assessmentQuestionIdSchema),
  assessmentQuestionController.getAssessmentQuestionById
);

/**
 * Update Assessment Question
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(updateAssessmentQuestionSchema),
  assessmentQuestionController.updateAssessmentQuestion
);

/**
 * Delete Assessment Question
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(assessmentQuestionIdSchema),
  assessmentQuestionController.deleteAssessmentQuestion
);

export default router;