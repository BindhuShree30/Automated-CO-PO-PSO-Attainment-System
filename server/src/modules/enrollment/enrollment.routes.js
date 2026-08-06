/**
 * ------------------------------------------------------------------
 * Enrollment Routes
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { Router } from "express";

import enrollmentController from "./enrollment.controller.js";

import authMiddleware from "../../middleware/auth.middleware.js";
import roleMiddleware from "../../middleware/role.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import ROLES from "../../shared/constants/roles.js";

import {
  createEnrollmentSchema,
  updateEnrollmentSchema,
  enrollmentIdSchema,
} from "./enrollment.schema.js";

const router = Router();

/**
 * Create Enrollment
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(createEnrollmentSchema),
  enrollmentController.createEnrollment
);

/**
 * Get All Enrollments
 */
router.get(
  "/",
  authMiddleware,
  enrollmentController.getEnrollments
);

/**
 * Get Enrollment By ID
 */
router.get(
  "/:id",
  authMiddleware,
  validate(enrollmentIdSchema),
  enrollmentController.getEnrollmentById
);

/**
 * Update Enrollment
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(updateEnrollmentSchema),
  enrollmentController.updateEnrollment
);

/**
 * Delete Enrollment
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(enrollmentIdSchema),
  enrollmentController.deleteEnrollment
);

export default router;