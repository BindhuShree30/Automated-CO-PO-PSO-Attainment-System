/**
 * ------------------------------------------------------------------
 * CO–PSO Mapping Controller
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { StatusCodes } from "http-status-codes";

import service from "./coPsoMapping.service.js";

class CoPsoMappingController {
  // ================================================================
  // CREATE
  // ================================================================

  async create(req, res, next) {
    try {
      const mapping =
        await service.create(req.body);

      return res
        .status(StatusCodes.CREATED)
        .json({
          success: true,

          message:
            "CO-PSO Mapping created successfully.",

          data: mapping,
        });
    } catch (error) {
      next(error);
    }
  }

  // ================================================================
  // GET ALL
  // ================================================================

  async getAll(req, res, next) {
    try {
      const mappings =
        await service.findAll();

      return res
        .status(StatusCodes.OK)
        .json({
          success: true,

          count:
            mappings.length,

          data: mappings,
        });
    } catch (error) {
      next(error);
    }
  }

  // ================================================================
  // GET BY ID
  // ================================================================

  async getById(req, res, next) {
    try {
      const mapping =
        await service.findById(
          req.params.id
        );

      return res
        .status(StatusCodes.OK)
        .json({
          success: true,

          data: mapping,
        });
    } catch (error) {
      next(error);
    }
  }

  // ================================================================
  // GET BY COURSE OUTCOME
  // ================================================================

  async getByCourseOutcome(
    req,
    res,
    next
  ) {
    try {
      const mappings =
        await service.findByCourseOutcomeId(
          req.params.courseOutcomeId
        );

      return res
        .status(StatusCodes.OK)
        .json({
          success: true,

          count:
            mappings.length,

          data: mappings,
        });
    } catch (error) {
      next(error);
    }
  }

  // ================================================================
  // GET BY PROGRAM SPECIFIC OUTCOME
  // ================================================================

  async getByProgramSpecificOutcome(
    req,
    res,
    next
  ) {
    try {
      const mappings =
        await service.findByProgramSpecificOutcomeId(
          req.params
            .programSpecificOutcomeId
        );

      return res
        .status(StatusCodes.OK)
        .json({
          success: true,

          count:
            mappings.length,

          data: mappings,
        });
    } catch (error) {
      next(error);
    }
  }

  // ================================================================
  // GET CO–PSO MATRIX
  // ================================================================

  async getMatrix(
    req,
    res,
    next
  ) {
    try {
      const matrix =
        await service.getMatrix(
          req.params.courseId
        );

      return res
        .status(StatusCodes.OK)
        .json({
          success: true,

          message:
            "CO-PSO Matrix fetched successfully.",

          data: matrix,
        });
    } catch (error) {
      next(error);
    }
  }

  // ================================================================
  // AUTOMATED CO–PSO MAPPING
  // ================================================================
  //
  // Gemini generates recommendations.
  //
  // IMPORTANT:
  // This endpoint does NOT save anything to the database.
  //
  // Faculty reviews the suggestions first.
  //
  // ================================================================

  async automateMapping(
    req,
    res,
    next
  ) {
    try {
      const {
        courseId,
      } = req.params;

      const result =
        await service.automateMapping(
          courseId
        );

      return res
        .status(StatusCodes.OK)
        .json({
          success: true,

          message:
            "Automated CO-PSO mapping suggestions generated successfully.",

          data: result,
        });
    } catch (error) {
      next(error);
    }
  }

  // ================================================================
  // SAVE CO–PSO MATRIX
  // ================================================================

  async saveMatrix(
    req,
    res,
    next
  ) {
    try {
      const {
        courseId,
        matrix,
      } = req.body;

      const result =
        await service.saveMatrix(
          courseId,
          matrix
        );

      return res
        .status(StatusCodes.OK)
        .json({
          success: true,

          message:
            "CO-PSO Matrix saved successfully.",

          data: result,
        });
    } catch (error) {
      next(error);
    }
  }

  // ================================================================
  // UPDATE
  // ================================================================

  async update(
    req,
    res,
    next
  ) {
    try {
      const mapping =
        await service.update(
          req.params.id,
          req.body
        );

      return res
        .status(StatusCodes.OK)
        .json({
          success: true,

          message:
            "CO-PSO Mapping updated successfully.",

          data: mapping,
        });
    } catch (error) {
      next(error);
    }
  }

  // ================================================================
  // DELETE
  // ================================================================

  async remove(
    req,
    res,
    next
  ) {
    try {
      const result =
        await service.remove(
          req.params.id
        );

      return res
        .status(StatusCodes.OK)
        .json({
          success: true,

          message:
            result.message,
        });
    } catch (error) {
      next(error);
    }
  }
}

export default new CoPsoMappingController();