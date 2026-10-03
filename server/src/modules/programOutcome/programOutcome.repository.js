/**
 * ------------------------------------------------------------------
 * Program Outcome Repository
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import ProgramOutcome from "../../database/models/ProgramOutcome.js";
import Program from "../../database/models/Program.js";

/**
 * Common Includes
 */
const programOutcomeIncludes = [
  {
    model: Program,
    as: "program",
    attributes: [
      "id",
      "name",
      "code",
      "duration",
      "status",
    ],
  },
];

class ProgramOutcomeRepository {
  /**
   * Create Program Outcome
   */
  async create(data) {
    return ProgramOutcome.create(data);
  }

  /**
   * Get All Program Outcomes
   */
  async findAll() {
    return ProgramOutcome.findAll({
      include: programOutcomeIncludes,
      order: [
        ["programId", "ASC"],
        ["code", "ASC"],
      ],
    });
  }

  /**
   * Get Program Outcome By ID
   */
  async findById(id) {
    return ProgramOutcome.findByPk(id, {
      include: programOutcomeIncludes,
    });
  }

  /**
   * Find Program Outcome By Code
   */
  async findByCodeAndProgram(
    code,
    programId
  ) {
    return ProgramOutcome.findOne({
      where: {
        code,
        programId,
      },
    });
  }

  /**
   * Find Program Outcomes By Program
   */
  async findByProgramId(programId) {
    return ProgramOutcome.findAll({
      where: {
        programId,
      },
      include: programOutcomeIncludes,
      order: [["code", "ASC"]],
    });
  }

  /**
   * Update Program Outcome
   */
  async update(id, data) {
    const programOutcome =
      await ProgramOutcome.findByPk(id);

    if (!programOutcome) {
      return null;
    }

    await programOutcome.update(data);

    return this.findById(id);
  }

  /**
   * Delete Program Outcome
   */
  async delete(id) {
    const programOutcome =
      await ProgramOutcome.findByPk(id);

    if (!programOutcome) {
      return false;
    }

    await programOutcome.destroy();

    return true;
  }
}

export default new ProgramOutcomeRepository();