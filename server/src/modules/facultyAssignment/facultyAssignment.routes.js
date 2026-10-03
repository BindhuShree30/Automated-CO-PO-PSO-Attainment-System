/**
 * ------------------------------------------------------------------
 * Faculty Assignment Routes
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { Router } from "express";

import controller from "./facultyAssignment.controller.js";

import validate from "../../middleware/validate.middleware.js";
import authenticate from "../../middleware/auth.middleware.js";

import {
  createFacultyAssignmentSchema,
  updateFacultyAssignmentSchema,
  facultyAssignmentIdSchema,
} from "./facultyAssignment.schema.js";

const router = Router();

/**
 * ------------------------------------------------------------------
 * Create Assignment
 * ------------------------------------------------------------------
 */

router.post(
  "/",
  authenticate,
  validate(
    createFacultyAssignmentSchema
  ),
  controller.createAssignment
);

/**
 * ------------------------------------------------------------------
 * Get My Courses
 *
 * IMPORTANT:
 * Must come before /:id
 * ------------------------------------------------------------------
 */

router.get(
  "/my-courses",
  authenticate,
  controller.getMyCourses
);

/**
 * ------------------------------------------------------------------
 * Get All Assignments
 * ------------------------------------------------------------------
 */

router.get(
  "/",
  authenticate,
  controller.getAllAssignments
);

/**
 * ------------------------------------------------------------------
 * Get Assignment By ID
 * ------------------------------------------------------------------
 */

router.get(
  "/:id",
  authenticate,
  validate(
    facultyAssignmentIdSchema
  ),
  controller.getAssignmentById
);

/**
 * ------------------------------------------------------------------
 * Update Assignment
 * ------------------------------------------------------------------
 */

router.put(
  "/:id",
  authenticate,
  validate(
    updateFacultyAssignmentSchema
  ),
  controller.updateAssignment
);

/**
 * ------------------------------------------------------------------
 * Delete Assignment
 * ------------------------------------------------------------------
 */

router.delete(
  "/:id",
  authenticate,
  validate(
    facultyAssignmentIdSchema
  ),
  controller.deleteAssignment
);

export default router;