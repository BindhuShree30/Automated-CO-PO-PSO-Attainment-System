/**
 * ------------------------------------------------------------------
 * Course Offering Routes
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { Router } from "express";

import CourseOfferingController from "./courseOffering.controller.js";

import validate from "../../middleware/validate.middleware.js";
import authenticate from "../../middleware/auth.middleware.js";

import {
  createCourseOfferingSchema,
  updateCourseOfferingSchema,
  courseOfferingIdSchema,
} from "./courseOffering.schema.js";

const router = Router();

/**
 * Create Course Offering
 */
router.post(
  "/",
  authenticate,
  validate(createCourseOfferingSchema),
  CourseOfferingController.createCourseOffering
);

/**
 * Get All Course Offerings
 */
router.get(
  "/",
  authenticate,
  CourseOfferingController.getAllCourseOfferings
);

/**
 * Get Course Offering By ID
 */
router.get(
  "/:id",
  authenticate,
  validate(courseOfferingIdSchema),
  CourseOfferingController.getCourseOfferingById
);

/**
 * Update Course Offering
 */
router.put(
  "/:id",
  authenticate,
  validate(updateCourseOfferingSchema),
  CourseOfferingController.updateCourseOffering
);

/**
 * Delete Course Offering
 */
router.delete(
  "/:id",
  authenticate,
  validate(courseOfferingIdSchema),
  CourseOfferingController.deleteCourseOffering
);

export default router;