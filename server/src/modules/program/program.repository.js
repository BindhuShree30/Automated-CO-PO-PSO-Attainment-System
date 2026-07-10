/**
 * ------------------------------------------------------------------
 * Program Repository
 * ------------------------------------------------------------------
 * Handles all database operations related to programs.
 * ------------------------------------------------------------------
 */

import Program from "../../database/models/Program.js";

/**
 * Create Program
 */
const createProgram = async (programData) => {
  return await Program.create(programData);
};

/**
 * Find all Programs
 */
const findAllPrograms = async () => {
  return await Program.findAll();
};

/**
 * Find Program by ID
 */
const findProgramById = async (id) => {
  return await Program.findByPk(id);
};

/**
 * Find Program by Code
 */
const findProgramByCode = async (code) => {
  return await Program.findOne({
    where: { code },
  });
};

/**
 * Update Program
 */
const updateProgram = async (id, programData) => {
  const program = await findProgramById(id);

  if (!program) {
    return null;
  }

  return await program.update(programData);
};

/**
 * Delete Program
 */
const deleteProgram = async (id) => {
  const program = await findProgramById(id);

  if (!program) {
    return null;
  }

  await program.destroy();

  return true;
};

export default {
  createProgram,
  findAllPrograms,
  findProgramById,
  findProgramByCode,
  updateProgram,
  deleteProgram,
};