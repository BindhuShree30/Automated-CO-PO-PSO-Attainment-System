/**
 * ------------------------------------------------------------------
 * Program Repository
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 * Handles Program database operations.
 * ------------------------------------------------------------------
 */

import Program from "../../database/models/Program.js";
import Department from "../../database/models/Department.js";

/**
 * Common Program associations
 */
const programIncludes = [
  {
    model: Department,
    as: "department",
    attributes: [
      "id",
      "name",
      "code",
    ],
  },
];

class ProgramRepository {
  /**
   * Create Program
   */
  async createProgram(programData) {
    return Program.create(programData);
  }

  /**
   * Find Program By ID
   */
  async findProgramById(id) {
    return Program.findByPk(id, {
      include: programIncludes,
    });
  }

  /**
   * Generic Alias
   */
  async findById(id) {
    return this.findProgramById(id);
  }

  /**
   * Find Program By Code
   */
  async findProgramByCode(code) {
    return Program.findOne({
      where: {
        code,
      },
    });
  }

  /**
   * Get All Programs
   */
  async findAllPrograms() {
    return Program.findAll({
      include: programIncludes,
      order: [["createdAt", "DESC"]],
    });
  }

  /**
   * Update Program
   */
  async updateProgram(id, programData) {
    const program =
      await this.findProgramById(id);

    if (!program) {
      return null;
    }

    await program.update(programData);

    return this.findProgramById(id);
  }

  /**
   * Delete Program
   */
  async deleteProgram(id) {
    const program =
      await this.findProgramById(id);

    if (!program) {
      return null;
    }

    await program.destroy();

    return true;
  }
}

export default new ProgramRepository();