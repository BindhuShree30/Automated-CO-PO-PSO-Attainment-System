import { StatusCodes } from "http-status-codes";
import ApiError from "../../shared/errors/ApiError.js";
import repository from "./coPsoMapping.repository.js";

class CoPsoMappingService {
  async create(data) {
    const existing = await repository.findExistingMapping(
      data.courseOutcomeId,
      data.programSpecificOutcomeId
    );

    if (existing) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "CO-PSO Mapping already exists."
      );
    }

    return await repository.create(data);
  }

  async findAll() {
    return await repository.findAll();
  }

  async findById(id) {
    const mapping = await repository.findById(id);

    if (!mapping) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "CO-PSO Mapping not found."
      );
    }

    return mapping;
  }

  async findByCourseOutcomeId(courseOutcomeId) {
    return await repository.findByCourseOutcomeId(courseOutcomeId);
  }

  async findByProgramSpecificOutcomeId(programSpecificOutcomeId) {
    return await repository.findByProgramSpecificOutcomeId(
      programSpecificOutcomeId
    );
  }

  async update(id, data) {
    const mapping = await repository.findById(id);

    if (!mapping) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "CO-PSO Mapping not found."
      );
    }

    if (
      data.courseOutcomeId &&
      data.programSpecificOutcomeId
    ) {
      const existing = await repository.findExistingMapping(
        data.courseOutcomeId,
        data.programSpecificOutcomeId
      );

      if (existing && existing.id !== id) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "CO-PSO Mapping already exists."
        );
      }
    }

    return await repository.update(mapping, data);
  }

  async remove(id) {
    const mapping = await repository.findById(id);

    if (!mapping) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "CO-PSO Mapping not found."
      );
    }

    await repository.remove(mapping);

    return {
      message: "CO-PSO Mapping deleted successfully.",
    };
  }
}

export default new CoPsoMappingService();