/**
 * ------------------------------------------------------------------
 * Program Outcome Controller
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import programOutcomeService from "./programOutcome.service.js";
import asyncHandler from "../../shared/helpers/asyncHandler.js";
import {
  successResponse,
} from "../../shared/helpers/apiResponse.js";

/**
 * Create Program Outcome
 */
const createProgramOutcome = asyncHandler(
  async (req, res) => {
    const programOutcome =
      await programOutcomeService.createProgramOutcome(
        req.validatedData.body
      );

    return successResponse(
      res,
      "Program Outcome created successfully.",
      programOutcome,
      201
    );
  }
);

/**
 * Get All Program Outcomes
 */
const getProgramOutcomes = asyncHandler(
  async (req, res) => {
    const programOutcomes =
      await programOutcomeService.getProgramOutcomes();

    return successResponse(
      res,
      "Program Outcomes fetched successfully.",
      programOutcomes
    );
  }
);

/**
 * Get Program Outcome By ID
 */
const getProgramOutcomeById = asyncHandler(
  async (req, res) => {
    const programOutcome =
      await programOutcomeService.getProgramOutcomeById(
        req.params.id
      );

    return successResponse(
      res,
      "Program Outcome fetched successfully.",
      programOutcome
    );
  }
);

/**
 * Get Program Outcomes By Program
 */
const getProgramOutcomesByProgramId =
  asyncHandler(async (req, res) => {
    const programOutcomes =
      await programOutcomeService.getProgramOutcomesByProgramId(
        req.params.programId
      );

    return successResponse(
      res,
      "Program Outcomes fetched successfully.",
      programOutcomes
    );
  });

/**
 * Update Program Outcome
 */
const updateProgramOutcome = asyncHandler(
  async (req, res) => {
    const programOutcome =
      await programOutcomeService.updateProgramOutcome(
        req.params.id,
        req.validatedData.body
      );

    return successResponse(
      res,
      "Program Outcome updated successfully.",
      programOutcome
    );
  }
);

/**
 * Delete Program Outcome
 */
const deleteProgramOutcome = asyncHandler(
  async (req, res) => {
    await programOutcomeService.deleteProgramOutcome(
      req.params.id
    );

    return successResponse(
      res,
      "Program Outcome deleted successfully.",
      null
    );
  }
);

export default {
  createProgramOutcome,
  getProgramOutcomes,
  getProgramOutcomeById,
  getProgramOutcomesByProgramId,
  updateProgramOutcome,
  deleteProgramOutcome,
};