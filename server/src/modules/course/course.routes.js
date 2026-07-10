import { Router } from "express";

import courseController from "./course.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import roleMiddleware from "../../middleware/role.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import ROLES from "../../shared/constants/roles.js";

import {
  createCourseSchema,
  updateCourseSchema,
} from "./course.schema.js";

const router = Router();

/**
 * Create Course
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(createCourseSchema),
  courseController.createCourse
);

/**
 * Get All Courses
 */
router.get(
  "/",
  authMiddleware,
  courseController.getCourses
);

/**
 * Get Course By ID
 */
router.get(
  "/:id",
  authMiddleware,
  courseController.getCourseById
);

/**
 * Update Course
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(updateCourseSchema),
  courseController.updateCourse
);

/**
 * Delete Course
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  courseController.deleteCourse
);

export default router;