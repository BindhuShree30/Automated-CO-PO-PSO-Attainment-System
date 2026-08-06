/**
 * ------------------------------------------------------------------
 * Batch Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import BatchRepository from "./batch.repository.js";
import Program from "../../database/models/Program.js";
import ApiError from "../../shared/errors/ApiError.js";

class BatchService {
  /**
   * Create Batch
   */
  async createBatch(data) {
    const { programId, startYear, endYear } = data;

    // Check whether Program exists
    const program = await Program.findByPk(programId);

    if (!program) {
      throw new ApiError(404, "Program not found.");
    }

    // Validate Batch duration using Program duration
    if (endYear !== startYear + program.duration) {
      throw new ApiError(
        400,
        `Batch duration must match the Program duration of ${program.duration} years.`
      );
    }

    // Check duplicate Batch
    const existingBatch =
      await BatchRepository.findByProgramAndYears(
        programId,
        startYear,
        endYear
      );

    if (existingBatch) {
      throw new ApiError(
        409,
        "Batch already exists for this Program and year range."
      );
    }

    // Automatically generate Batch name
    const name = `${startYear}-${endYear}`;

    return BatchRepository.create({
      ...data,
      name,
    });
  }

  /**
   * Get All Batches
   */
  async getAllBatches() {
    return BatchRepository.findAll();
  }

  /**
   * Get Batch By ID
   */
  async getBatchById(id) {
    const batch = await BatchRepository.findById(id);

    if (!batch) {
      throw new ApiError(404, "Batch not found.");
    }

    return batch;
  }

  /**
   * Update Batch
   */
  async updateBatch(id, data) {
    const batch = await BatchRepository.findById(id);

    if (!batch) {
      throw new ApiError(404, "Batch not found.");
    }

    const programId = data.programId ?? batch.programId;
    const startYear = data.startYear ?? batch.startYear;
    const endYear = data.endYear ?? batch.endYear;

    // Check Program
    const program = await Program.findByPk(programId);

    if (!program) {
      throw new ApiError(404, "Program not found.");
    }

    // Validate Batch duration dynamically
    if (endYear !== startYear + program.duration) {
      throw new ApiError(
        400,
        `Batch duration must match the Program duration of ${program.duration} years.`
      );
    }

    // Check duplicate Batch
    const existingBatch =
      await BatchRepository.findByProgramAndYears(
        programId,
        startYear,
        endYear
      );

    if (existingBatch && existingBatch.id !== id) {
      throw new ApiError(
        409,
        "Batch already exists for this Program and year range."
      );
    }

    // Automatically regenerate Batch name
    const name = `${startYear}-${endYear}`;

    return BatchRepository.update(id, {
      ...data,
      programId,
      startYear,
      endYear,
      name,
    });
  }

  /**
   * Delete Batch
   */
  async deleteBatch(id) {
    const deleted = await BatchRepository.delete(id);

    if (!deleted) {
      throw new ApiError(404, "Batch not found.");
    }

    return true;
  }
}

export default new BatchService();