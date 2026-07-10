/**
 * ------------------------------------------------------------------
 * Program Controller
 * ------------------------------------------------------------------
 */

import programService from "./program.service.js";
import asyncHandler from "../../shared/helpers/asyncHandler.js";
import { successResponse } from "../../shared/helpers/apiResponse.js";

/**
 * Create Program
 */
const createProgram = asyncHandler(async (req, res) => {
  const program = await programService.createProgram(req.validatedData);

  return successResponse(
    res,
    "Program created successfully.",
    program,
    201
  );
});

/**
 * Get All Programs
 */
const getPrograms = asyncHandler(async (req, res) => {
  const programs = await programService.getPrograms();

  return successResponse(
    res,
    "Programs fetched successfully.",
    programs
  );
});

/**
 * Get Program By ID
 */
const getProgramById = asyncHandler(async (req, res) => {
  const program = await programService.getProgramById(req.params.id);

  return successResponse(
    res,
    "Program fetched successfully.",
    program
  );
});

/**
 * Update Program
 */
const updateProgram = asyncHandler(async (req, res) => {
  const program = await programService.updateProgram(
    req.params.id,
    req.validatedData
  );

  return successResponse(
    res,
    "Program updated successfully.",
    program
  );
});

/**
 * Delete Program
 */
const deleteProgram = asyncHandler(async (req, res) => {
  await programService.deleteProgram(req.params.id);

  return successResponse(
    res,
    "Program deleted successfully.",
    null
  );
});

export default {
  createProgram,
  getPrograms,
  getProgramById,
  updateProgram,
  deleteProgram,
};