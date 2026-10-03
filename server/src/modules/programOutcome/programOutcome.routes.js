/**
 * ------------------------------------------------------------------
 * Program Outcome Routes
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * HOD manages Program Outcomes.
 * Faculty can access Program Outcomes for academic mapping.
 *
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
 * ------------------------------------------------------------------
 * Create Program Outcome
 * ------------------------------------------------------------------
 *
 * HOD only.
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.HOD),
  validate(createProgramOutcomeSchema),
  programOutcomeController.createProgramOutcome
);

/**
 * ------------------------------------------------------------------
 * Get All Program Outcomes
 * ------------------------------------------------------------------
 *
 * Authenticated users can view Program Outcomes.
 */
router.get(
  "/",
  authMiddleware,
  programOutcomeController.getProgramOutcomes
);

/**
 * ------------------------------------------------------------------
 * Get Program Outcomes By Program
 * ------------------------------------------------------------------
 *
 * Used by CO–PO Mapping.
 */
router.get(
  "/program/:programId",
  authMiddleware,
  validate(programIdSchema),
  programOutcomeController.getProgramOutcomesByProgramId
);

/**
 * ------------------------------------------------------------------
 * Get Program Outcome By ID
 * ------------------------------------------------------------------
 */
router.get(
  "/:id",
  authMiddleware,
  validate(programOutcomeIdSchema),
  programOutcomeController.getProgramOutcomeById
);

/**
 * ------------------------------------------------------------------
 * Update Program Outcome
 * ------------------------------------------------------------------
 *
 * HOD only.
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.HOD),
  validate(updateProgramOutcomeSchema),
  programOutcomeController.updateProgramOutcome
);

/**
 * ------------------------------------------------------------------
 * Delete Program Outcome
 * ------------------------------------------------------------------
 *
 * HOD only.
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.HOD),
  validate(programOutcomeIdSchema),
  programOutcomeController.deleteProgramOutcome
);

export default router;