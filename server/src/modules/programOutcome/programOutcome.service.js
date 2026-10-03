/**
 * ------------------------------------------------------------------
 * Program Outcome Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import programOutcomeRepository from "./programOutcome.repository.js";
import programRepository from "../program/program.repository.js";
import ApiError from "../../shared/errors/ApiError.js";

/**
 * Create Program Outcome
 */
const createProgramOutcome = async (data) => {
  const {
    programId,
    code,
  } = data;

  // Check Program
  const program =
    await programRepository.findById(programId);

  if (!program) {
    throw new ApiError(
      404,
      "Program not found."
    );
  }

  // Check Duplicate PO Code
  const existingProgramOutcome =
    await programOutcomeRepository.findByCodeAndProgram(
      code,
      programId
    );

  if (existingProgramOutcome) {
    throw new ApiError(
      409,
      "Program Outcome code already exists for this Program."
    );
  }

  return await programOutcomeRepository.create(
    data
  );
};

/**
 * Get All Program Outcomes
 */
const getProgramOutcomes = async () => {
  return await programOutcomeRepository.findAll();
};

/**
 * Get Program Outcome By ID
 */
const getProgramOutcomeById = async (id) => {
  const programOutcome =
    await programOutcomeRepository.findById(id);

  if (!programOutcome) {
    throw new ApiError(
      404,
      "Program Outcome not found."
    );
  }

  return programOutcome;
};

/**
 * Get Program Outcomes By Program
 */
const getProgramOutcomesByProgramId = async (
  programId
) => {
  const program =
    await programRepository.findById(programId);

  if (!program) {
    throw new ApiError(
      404,
      "Program not found."
    );
  }

  return await programOutcomeRepository.findByProgramId(
    programId
  );
};

/**
 * Update Program Outcome
 */
const updateProgramOutcome = async (
  id,
  data
) => {
  const programOutcome =
    await programOutcomeRepository.findById(id);

  if (!programOutcome) {
    throw new ApiError(
      404,
      "Program Outcome not found."
    );
  }

  return await programOutcomeRepository.update(
    id,
    data
  );
};

/**
 * Delete Program Outcome
 */
const deleteProgramOutcome = async (id) => {
  const programOutcome =
    await programOutcomeRepository.findById(id);

  if (!programOutcome) {
    throw new ApiError(
      404,
      "Program Outcome not found."
    );
  }

  await programOutcomeRepository.delete(id);
};

export default {
  createProgramOutcome,
  getProgramOutcomes,
  getProgramOutcomeById,
  getProgramOutcomesByProgramId,
  updateProgramOutcome,
  deleteProgramOutcome,
};