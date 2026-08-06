/**
 * ------------------------------------------------------------------
 * Program Outcome Routes
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { Router } from "express";

import programOutcomeController from "./programOutcome.controller.js";

import authMiddleware from "../../middleware/auth.middleware.js";
import roleMiddleware from "../../middleware/role.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import ROLES from "../../shared/constants/roles.js";

import {
  createProgramOutcomeSchema,
  updateProgramOutcomeSchema,
  programOutcomeIdSchema,
  programIdSchema,
} from "./programOutcome.schema.js";

const router = Router();

/**
 * Create Program Outcome
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(createProgramOutcomeSchema),
  programOutcomeController.createProgramOutcome
);

/**
 * Get All Program Outcomes
 */
router.get(
  "/",
  authMiddleware,
  programOutcomeController.getProgramOutcomes
);

/**
 * Get Program Outcomes By Program
 */
router.get(
  "/program/:programId",
  authMiddleware,
  validate(programIdSchema),
  programOutcomeController.getProgramOutcomesByProgramId
);

/**
 * Get Program Outcome By ID
 */
router.get(
  "/:id",
  authMiddleware,
  validate(programOutcomeIdSchema),
  programOutcomeController.getProgramOutcomeById
);

/**
 * Update Program Outcome
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(updateProgramOutcomeSchema),
  programOutcomeController.updateProgramOutcome
);

/**
 * Delete Program Outcome
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(programOutcomeIdSchema),
  programOutcomeController.deleteProgramOutcome
);

export default router;