/**
 * ------------------------------------------------------------------
 * Program Service
 * ------------------------------------------------------------------
 * Handles business logic for programs.
 * ------------------------------------------------------------------
 */

import programRepository from "./program.repository.js";
import departmentRepository from "../department/department.repository.js";
import ApiError from "../../shared/errors/ApiError.js";

/**
 * Create Program
 */
const createProgram = async (programData) => {
  const { code, departmentId } = programData;

  // Check if Department exists
  const department = await departmentRepository.findDepartmentById(
    departmentId
  );

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  // Check if Program code already exists
  const existingProgram = await programRepository.findProgramByCode(code);

  if (existingProgram) {
    throw new ApiError(409, "Program code already exists");
  }

  // Create Program
  return await programRepository.createProgram(programData);
};

/**
 * Get All Programs
 */
const getPrograms = async () => {
  return await programRepository.findAllPrograms();
};

/**
 * Get Program By ID
 */
const getProgramById = async (id) => {
  const program = await programRepository.findProgramById(id);

  if (!program) {
    throw new ApiError(404, "Program not found");
  }

  return program;
};

/**
 * Update Program
 */
const updateProgram = async (id, programData) => {
  const program = await programRepository.findProgramById(id);

  if (!program) {
    throw new ApiError(404, "Program not found");
  }

  // If department is being updated, check if it exists
  if (programData.departmentId) {
    const department = await departmentRepository.findDepartmentById(
      programData.departmentId
    );

    if (!department) {
      throw new ApiError(404, "Department not found");
    }
  }

  // If code is being updated, ensure it's unique
  if (programData.code && programData.code !== program.code) {
    const existingProgram = await programRepository.findProgramByCode(
      programData.code
    );

    if (existingProgram) {
      throw new ApiError(409, "Program code already exists");
    }
  }

  return await programRepository.updateProgram(id, programData);
};

/**
 * Delete Program
 */
const deleteProgram = async (id) => {
  const program = await programRepository.findProgramById(id);

  if (!program) {
    throw new ApiError(404, "Program not found");
  }

  await programRepository.deleteProgram(id);
};

export default {
  createProgram,
  getPrograms,
  getProgramById,
  updateProgram,
  deleteProgram,
};