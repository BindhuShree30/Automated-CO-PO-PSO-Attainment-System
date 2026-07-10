/**
 * ------------------------------------------------------------------
 * Faculty Routes
 * ------------------------------------------------------------------
 */

import { Router } from "express";

import facultyController from "./faculty.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import roleMiddleware from "../../middleware/role.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import ROLES from "../../shared/constants/roles.js";

import {
  createFacultySchema,
  updateFacultySchema,
} from "./faculty.schema.js";

const router = Router();

/**
 * Create Faculty
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(createFacultySchema),
  facultyController.createFaculty
);

/**
 * Get All Faculties
 */
router.get(
  "/",
  authMiddleware,
  facultyController.getFaculties
);

/**
 * Get Faculty By ID
 */
router.get(
  "/:id",
  authMiddleware,
  facultyController.getFacultyById
);

/**
 * Update Faculty
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(updateFacultySchema),
  facultyController.updateFaculty
);

/**
 * Delete Faculty
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  facultyController.deleteFaculty
);

export default router;