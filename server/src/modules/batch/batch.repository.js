/**
 * ------------------------------------------------------------------
 * Batch Repository
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import Batch from "../../database/models/Batch.js";
import Program from "../../database/models/Program.js";

class BatchRepository {
  /**
   * Create Batch
   */
  async create(data) {
    return Batch.create(data);
  }

  /**
   * Get All Batches
   */
  async findAll() {
    return Batch.findAll({
      include: [
        {
          model: Program,
          as: "program",
          attributes: ["id", "name", "code"],
        },
      ],
      order: [["startYear", "DESC"]],
    });
  }

  /**
   * Get Batch By ID
   */
  async findById(id) {
    return Batch.findByPk(id, {
      include: [
        {
          model: Program,
          as: "program",
          attributes: ["id", "name", "code"],
        },
      ],
    });
  }

  /**
   * Find Duplicate Batch
   */
  async findByProgramAndYears(programId, startYear, endYear) {
    return Batch.findOne({
      where: {
        programId,
        startYear,
        endYear,
      },
    });
  }

  /**
   * Update Batch
   */
  async update(id, data) {
    const batch = await Batch.findByPk(id);

    if (!batch) {
      return null;
    }

    return batch.update(data);
  }

  /**
   * Delete Batch
   */
  async delete(id) {
    const batch = await Batch.findByPk(id);

    if (!batch) {
      return null;
    }

    await batch.destroy();

    return true;
  }
}

export default new BatchRepository();