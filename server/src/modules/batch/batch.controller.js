/**
 * ------------------------------------------------------------------
 * Batch Controller
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import BatchService from "./batch.service.js";

class BatchController {
  /**
   * Create Batch
   */
  async createBatch(req, res, next) {
    try {
      const batch = await BatchService.createBatch(
        req.validatedData.body
      );

      return res.status(201).json({
        success: true,
        message: "Batch created successfully.",
        data: batch,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get All Batches
   */
  async getAllBatches(req, res, next) {
    try {
      const batches = await BatchService.getAllBatches();

      return res.status(200).json({
        success: true,
        message: "Batches fetched successfully.",
        data: batches,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Batch By ID
   */
  async getBatchById(req, res, next) {
    try {
      const batch = await BatchService.getBatchById(
        req.validatedData.params.id
      );

      return res.status(200).json({
        success: true,
        message: "Batch fetched successfully.",
        data: batch,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update Batch
   */
  async updateBatch(req, res, next) {
    try {
      const batch = await BatchService.updateBatch(
        req.validatedData.params.id,
        req.validatedData.body
      );

      return res.status(200).json({
        success: true,
        message: "Batch updated successfully.",
        data: batch,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete Batch
   */
  async deleteBatch(req, res, next) {
    try {
      await BatchService.deleteBatch(
        req.validatedData.params.id
      );

      return res.status(200).json({
        success: true,
        message: "Batch deleted successfully.",
        data: null,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new BatchController();