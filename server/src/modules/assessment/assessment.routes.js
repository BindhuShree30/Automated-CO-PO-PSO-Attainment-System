/**
 * ------------------------------------------------------------------
 * Assessment Routes
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { Router } from "express";

import assessmentController from "./assessment.controller.js";

import authMiddleware from "../../middleware/auth.middleware.js";
import roleMiddleware from "../../middleware/role.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import ROLES from "../../shared/constants/roles.js";

import {
  createAssessmentSchema,
  updateAssessmentSchema,
  assessmentIdSchema,
  courseOfferingAssessmentSchema,
} from "./assessment.schema.js";

const router = Router();

/**
 * Create Assessment
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.HOD,ROLES.FACULTY),
  validate(createAssessmentSchema),
  assessmentController.createAssessment
);

/**
 * Get All Assessments
 */
router.get(
  "/",
  authMiddleware,
  assessmentController.getAssessments
);

/**
 * Get Assessments By Course Offering
 *
 * IMPORTANT:
 * Keep this route before "/:id".
 */
router.get(
  "/course-offering/:courseOfferingId",
  authMiddleware,
  validate(courseOfferingAssessmentSchema),
  assessmentController.getAssessmentsByCourseOffering
);

/**
 * Get Assessment By ID
 */
router.get(
  "/:id",
  authMiddleware,
  validate(assessmentIdSchema),
  assessmentController.getAssessmentById
);

/**
 * Update Assessment
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.HOD,ROLES.FACULTY),
  validate(updateAssessmentSchema),
  assessmentController.updateAssessment
);

/**
 * Delete Assessment
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.HOD,ROLES.FACULTY),
  validate(assessmentIdSchema),
  assessmentController.deleteAssessment
);

export default router;