/**
 * ------------------------------------------------------------------
 * Department Routes
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { Router } from "express";

import departmentController from "./department.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import roleMiddleware from "../../middleware/role.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import ROLES from "../../shared/constants/roles.js";

import {
  createDepartmentSchema,
  updateDepartmentSchema,
} from "./department.schema.js";

const router = Router();

/**
 * ------------------------------------------------------------------
 * Create Department
 * ------------------------------------------------------------------
 *
 * ADMIN only.
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(createDepartmentSchema),
  departmentController.createDepartment
);

/**
 * ------------------------------------------------------------------
 * Get All Departments
 * ------------------------------------------------------------------
 *
 * PUBLIC
 *
 * Required by:
 * - Faculty Registration
 * - Course/Academic forms
 *
 * No authentication required because a new faculty
 * user does not have an access token yet.
 */
router.get(
  "/",
  departmentController.getDepartments
);

/**
 * ------------------------------------------------------------------
 * Get Department By ID
 * ------------------------------------------------------------------
 *
 * Authenticated users only.
 */
router.get(
  "/:id",
  authMiddleware,
  departmentController.getDepartmentById
);

/**
 * ------------------------------------------------------------------
 * Update Department
 * ------------------------------------------------------------------
 *
 * ADMIN only.
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(updateDepartmentSchema),
  departmentController.updateDepartment
);

/**
 * ------------------------------------------------------------------
 * Delete Department
 * ------------------------------------------------------------------
 *
 * ADMIN only.
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  departmentController.deleteDepartment
);

export default router;