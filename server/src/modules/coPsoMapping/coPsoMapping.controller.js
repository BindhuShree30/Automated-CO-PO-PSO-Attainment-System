import { StatusCodes } from "http-status-codes";
import service from "./coPsoMapping.service.js";

class CoPsoMappingController {
  async create(req, res, next) {
    try {
      const mapping = await service.create(req.body);

      return res.status(StatusCodes.CREATED).json({
        success: true,
        message: "CO-PSO Mapping created successfully.",
        data: mapping,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const mappings = await service.findAll();

      return res.status(StatusCodes.OK).json({
        success: true,
        count: mappings.length,
        data: mappings,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const mapping = await service.findById(req.params.id);

      return res.status(StatusCodes.OK).json({
        success: true,
        data: mapping,
      });
    } catch (error) {
      next(error);
    }
  }

  async getByCourseOutcome(req, res, next) {
    try {
      const mappings = await service.findByCourseOutcomeId(
        req.params.courseOutcomeId
      );

      return res.status(StatusCodes.OK).json({
        success: true,
        count: mappings.length,
        data: mappings,
      });
    } catch (error) {
      next(error);
    }
  }

  async getByProgramSpecificOutcome(req, res, next) {
    try {
      const mappings = await service.findByProgramSpecificOutcomeId(
        req.params.programSpecificOutcomeId
      );

      return res.status(StatusCodes.OK).json({
        success: true,
        count: mappings.length,
        data: mappings,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const mapping = await service.update(req.params.id, req.body);

      return res.status(StatusCodes.OK).json({
        success: true,
        message: "CO-PSO Mapping updated successfully.",
        data: mapping,
      });
    } catch (error) {
      next(error);
    }
  }

  async remove(req, res, next) {
    try {
      const result = await service.remove(req.params.id);

      return res.status(StatusCodes.OK).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CoPsoMappingController();