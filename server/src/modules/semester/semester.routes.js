/**
 * ------------------------------------------------------------------
 * Semester Routes
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { Router } from "express";

import SemesterController from "./semester.controller.js";

import validate from "../../middleware/validate.middleware.js";
import authenticate from "../../middleware/auth.middleware.js";

import {
  createSemesterSchema,
  updateSemesterSchema,
  semesterIdSchema,
} from "./semester.schema.js";

const router = Router();

/**
 * Create Semester
 */
router.post(
  "/",
  authenticate,
  validate(createSemesterSchema),
  SemesterController.createSemester
);

/**
 * Get All Semesters
 */
router.get(
  "/",
  authenticate,
  SemesterController.getAllSemesters
);

/**
 * Get Semester By ID
 */
router.get(
  "/:id",
  authenticate,
  validate(semesterIdSchema),
  SemesterController.getSemesterById
);

/**
 * Update Semester
 */
router.put(
  "/:id",
  authenticate,
  validate(updateSemesterSchema),
  SemesterController.updateSemester
);

/**
 * Delete Semester
 */
router.delete(
  "/:id",
  authenticate,
  validate(semesterIdSchema),
  SemesterController.deleteSemester
);

export default router;