/**
 * ------------------------------------------------------------------
 * Course Registration Routes
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { Router } from "express";

import courseRegistrationController from "./courseRegistration.controller.js";

import authMiddleware from "../../middleware/auth.middleware.js";
import roleMiddleware from "../../middleware/role.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import ROLES from "../../shared/constants/roles.js";

import {
  createCourseRegistrationSchema,
  updateCourseRegistrationSchema,
  courseRegistrationIdSchema,
} from "./courseRegistration.schema.js";

const router = Router();

/**
 * Create Course Registration
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(createCourseRegistrationSchema),
  courseRegistrationController.createCourseRegistration
);

/**
 * Get All Course Registrations
 */
router.get(
  "/",
  authMiddleware,
  courseRegistrationController.getCourseRegistrations
);

/**
 * Get Course Registration By ID
 */
router.get(
  "/:id",
  authMiddleware,
  validate(courseRegistrationIdSchema),
  courseRegistrationController.getCourseRegistrationById
);

/**
 * Update Course Registration
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(updateCourseRegistrationSchema),
  courseRegistrationController.updateCourseRegistration
);

/**
 * Delete Course Registration
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(courseRegistrationIdSchema),
  courseRegistrationController.deleteCourseRegistration
);

export default router;