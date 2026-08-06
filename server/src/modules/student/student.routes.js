/**
 * ------------------------------------------------------------------
 * Student Routes
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { Router } from "express";

import studentController from "./student.controller.js";

import authMiddleware from "../../middleware/auth.middleware.js";
import roleMiddleware from "../../middleware/role.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import ROLES from "../../shared/constants/roles.js";

import {
  createStudentSchema,
  updateStudentSchema,
  studentIdSchema,
} from "./student.schema.js";

const router = Router();

/**
 * Create Student
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(createStudentSchema),
  studentController.createStudent
);

/**
 * Get All Students
 */
router.get(
  "/",
  authMiddleware,
  studentController.getStudents
);

/**
 * Get Student By ID
 */
router.get(
  "/:id",
  authMiddleware,
  validate(studentIdSchema),
  studentController.getStudentById
);

/**
 * Update Student
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(updateStudentSchema),
  studentController.updateStudent
);

/**
 * Delete Student
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(studentIdSchema),
  studentController.deleteStudent
);

export default router;