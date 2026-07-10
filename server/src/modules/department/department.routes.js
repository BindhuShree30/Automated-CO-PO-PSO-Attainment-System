/**
 * ------------------------------------------------------------------
 * Department Routes
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
 * Create Department
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(createDepartmentSchema),
  departmentController.createDepartment
);

/**
 * Get All Departments
 */
router.get(
  "/",
  authMiddleware,
  departmentController.getDepartments
);

/**
 * Get Department By ID
 */
router.get(
  "/:id",
  authMiddleware,
  departmentController.getDepartmentById
);

/**
 * Update Department
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(updateDepartmentSchema),
  departmentController.updateDepartment
);

/**
 * Delete Department
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  departmentController.deleteDepartment
);

export default router;