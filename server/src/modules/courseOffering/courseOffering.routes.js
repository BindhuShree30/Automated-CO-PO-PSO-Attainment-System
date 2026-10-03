/**
 * ------------------------------------------------------------------
 * Course Offering Routes
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Handles Course Offering API routes.
 *
 * Base URL:
 *
 * /api/v1/course-offerings
 *
 * Course Offering connects:
 *
 * Course
 * Batch
 * Semester
 * Faculty
 * Section
 * ------------------------------------------------------------------
 */

import { Router } from "express";

import courseOfferingController from "./courseOffering.controller.js";

import authMiddleware from "../../middleware/auth.middleware.js";
import roleMiddleware from "../../middleware/role.middleware.js";

import ROLES from "../../shared/constants/roles.js";

const router = Router();

/**
 * ------------------------------------------------------------------
 * Create Course Offering
 * ------------------------------------------------------------------
 *
 * POST /api/v1/course-offerings
 *
 * Only HOD can create Course Offerings.
 * ------------------------------------------------------------------
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.HOD),
  courseOfferingController.createCourseOffering
);

/**
 * ------------------------------------------------------------------
 * Get My Course Offerings
 * ------------------------------------------------------------------
 *
 * GET /api/v1/course-offerings/my-courses
 *
 * Only FACULTY can access this endpoint.
 *
 * Returns ONLY the Course Offerings assigned to
 * the currently logged-in Faculty.
 *
 * IMPORTANT:
 *
 * This route MUST appear before:
 *
 * /:id
 *
 * Otherwise Express may interpret:
 *
 * "my-courses"
 *
 * as an ID.
 * ------------------------------------------------------------------
 */
router.get(
  "/my-courses",
  authMiddleware,
  roleMiddleware(ROLES.FACULTY),
  courseOfferingController.getMyCourseOfferings
);

/**
 * ------------------------------------------------------------------
 * Get All Course Offerings
 * ------------------------------------------------------------------
 *
 * GET /api/v1/course-offerings
 *
 * Used by HOD for Course Offering management.
 * ------------------------------------------------------------------
 */
router.get(
  "/",
  authMiddleware,
  courseOfferingController.getAllCourseOfferings
);

/**
 * ------------------------------------------------------------------
 * Get Course Offering By ID
 * ------------------------------------------------------------------
 *
 * GET /api/v1/course-offerings/:id
 * ------------------------------------------------------------------
 */
router.get(
  "/:id",
  authMiddleware,
  courseOfferingController.getCourseOfferingById
);

/**
 * ------------------------------------------------------------------
 * Update Course Offering
 * ------------------------------------------------------------------
 *
 * PUT /api/v1/course-offerings/:id
 *
 * Only HOD can update Course Offerings.
 * ------------------------------------------------------------------
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.HOD),
  courseOfferingController.updateCourseOffering
);

/**
 * ------------------------------------------------------------------
 * Delete Course Offering
 * ------------------------------------------------------------------
 *
 * DELETE /api/v1/course-offerings/:id
 *
 * Only HOD can delete Course Offerings.
 * ------------------------------------------------------------------
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.HOD),
  courseOfferingController.deleteCourseOffering
);

export default router;