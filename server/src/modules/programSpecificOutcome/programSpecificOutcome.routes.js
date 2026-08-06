/**
 * ------------------------------------------------------------------
 * Program Specific Outcome Routes
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { Router } from "express";

import programSpecificOutcomeController from "./programSpecificOutcome.controller.js";

import authMiddleware from "../../middleware/auth.middleware.js";
import roleMiddleware from "../../middleware/role.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import ROLES from "../../shared/constants/roles.js";

import {
  createProgramSpecificOutcomeSchema,
  updateProgramSpecificOutcomeSchema,
  programSpecificOutcomeIdSchema,
  programIdSchema,
} from "./programSpecificOutcome.schema.js";

const router = Router();

/**
 * ------------------------------------------------------------------
 * Create Program Specific Outcome
 * POST /api/v1/program-specific-outcomes
 * ------------------------------------------------------------------
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(createProgramSpecificOutcomeSchema),
  programSpecificOutcomeController.createProgramSpecificOutcome
);

/**
 * ------------------------------------------------------------------
 * Get All Program Specific Outcomes
 * GET /api/v1/program-specific-outcomes
 * ------------------------------------------------------------------
 */
router.get(
  "/",
  authMiddleware,
  programSpecificOutcomeController.getProgramSpecificOutcomes
);

/**
 * ------------------------------------------------------------------
 * Get Program Specific Outcomes By Program
 * GET /api/v1/program-specific-outcomes/program/:programId
 * ------------------------------------------------------------------
 */
router.get(
  "/program/:programId",
  authMiddleware,
  validate(programIdSchema),
  programSpecificOutcomeController.getProgramSpecificOutcomesByProgramId
);

/**
 * ------------------------------------------------------------------
 * Get Program Specific Outcome By ID
 * GET /api/v1/program-specific-outcomes/:id
 * ------------------------------------------------------------------
 */
router.get(
  "/:id",
  authMiddleware,
  validate(programSpecificOutcomeIdSchema),
  programSpecificOutcomeController.getProgramSpecificOutcomeById
);

/**
 * ------------------------------------------------------------------
 * Update Program Specific Outcome
 * PUT /api/v1/program-specific-outcomes/:id
 * ------------------------------------------------------------------
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(updateProgramSpecificOutcomeSchema),
  programSpecificOutcomeController.updateProgramSpecificOutcome
);

/**
 * ------------------------------------------------------------------
 * Delete Program Specific Outcome
 * DELETE /api/v1/program-specific-outcomes/:id
 * ------------------------------------------------------------------
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(programSpecificOutcomeIdSchema),
  programSpecificOutcomeController.deleteProgramSpecificOutcome
);

export default router;