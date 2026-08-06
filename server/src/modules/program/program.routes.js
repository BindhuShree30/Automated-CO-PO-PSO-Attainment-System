/**
 * ------------------------------------------------------------------
 * Program Routes
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { Router } from "express";

import programController from "./program.controller.js";

import authMiddleware from "../../middleware/auth.middleware.js";
import roleMiddleware from "../../middleware/role.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import ROLES from "../../shared/constants/roles.js";

import {
  createProgramSchema,
  updateProgramSchema,
  programIdSchema,
} from "./program.schema.js";

const router = Router();

/**
 * Create Program
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(createProgramSchema),
  programController.createProgram
);

/**
 * Get All Programs
 */
router.get(
  "/",
  authMiddleware,
  programController.getPrograms
);

/**
 * Get Program By ID
 */
router.get(
  "/:id",
  authMiddleware,
  validate(programIdSchema),
  programController.getProgramById
);

/**
 * Update Program
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(updateProgramSchema),
  programController.updateProgram
);

/**
 * Delete Program
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(programIdSchema),
  programController.deleteProgram
);

export default router;