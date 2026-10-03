/**
 * ------------------------------------------------------------------
 * CO–PSO Mapping Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { StatusCodes } from "http-status-codes";

import ApiError from "../../shared/errors/ApiError.js";

import repository from "./coPsoMapping.repository.js";

import aiService from "./coPsoMapping.ai.js";

class CoPsoMappingService {
  // ================================================================
  // CREATE
  // ================================================================

  async create(data) {
    const existing =
      await repository.findExistingMapping(
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

  // ================================================================
  // GET ALL
  // ================================================================

  async findAll() {
    return await repository.findAll();
  }

  // ================================================================
  // GET BY ID
  // ================================================================

  async findById(id) {
    const mapping =
      await repository.findById(id);

    if (!mapping) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "CO-PSO Mapping not found."
      );
    }

    return mapping;
  }

  // ================================================================
  // GET BY COURSE OUTCOME
  // ================================================================

  async findByCourseOutcomeId(
    courseOutcomeId
  ) {
    return await repository.findByCourseOutcomeId(
      courseOutcomeId
    );
  }

  // ================================================================
  // GET BY PROGRAM SPECIFIC OUTCOME
  // ================================================================

  async findByProgramSpecificOutcomeId(
    programSpecificOutcomeId
  ) {
    return await repository.findByProgramSpecificOutcomeId(
      programSpecificOutcomeId
    );
  }

  // ================================================================
  // GET CO–PSO MATRIX
  // ================================================================

  async getMatrix(courseId) {
    const matrix =
      await repository.getMatrixData(
        courseId
      );

    if (!matrix) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Course not found."
      );
    }

    return matrix;
  }

  // ================================================================
  // AUTOMATED CO–PSO MAPPING
  // ================================================================
  //
  // IMPORTANT:
  //
  // Gemini only generates recommendations.
  //
  // Nothing is written to the database here.
  //
  // Faculty reviews the suggestions and then
  // explicitly saves the matrix.
  //
  // ================================================================

  async automateMapping(courseId) {
    const matrix =
      await repository.getMatrixData(
        courseId
      );

    if (!matrix) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Course not found."
      );
    }

    // --------------------------------------------------------------
    // Validate Course Outcomes
    // --------------------------------------------------------------

    if (
      !matrix.courseOutcomes ||
      matrix.courseOutcomes.length === 0
    ) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "No Course Outcomes are available for this course."
      );
    }

    // --------------------------------------------------------------
    // Validate PSOs
    // --------------------------------------------------------------

    if (
      !matrix.programSpecificOutcomes ||
      matrix.programSpecificOutcomes.length === 0
    ) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "No active Program Specific Outcomes are available for this program."
      );
    }

    // --------------------------------------------------------------
    // Generate AI Suggestions
    // --------------------------------------------------------------

    const suggestions =
      await aiService.generateMapping({
        course: matrix.course,

        courseOutcomes:
          matrix.courseOutcomes,

        programSpecificOutcomes:
          matrix.programSpecificOutcomes,
      });

    // --------------------------------------------------------------
    // Create complete matrix for frontend
    //
    // AI returns only meaningful mappings.
    //
    // Missing combinations are represented as:
    //
    // mappingLevel: null
    //
    // The frontend can display them as "-".
    // --------------------------------------------------------------

    const suggestionMap =
      new Map();

    suggestions.forEach(
      (mapping) => {
        const key =
          `${mapping.courseOutcomeId}:${mapping.programSpecificOutcomeId}`;

        suggestionMap.set(
          key,
          mapping
        );
      }
    );

    const completeMatrix = [];

    for (
      const courseOutcome
      of matrix.courseOutcomes
    ) {
      for (
        const programSpecificOutcome
        of matrix.programSpecificOutcomes
      ) {
        const key =
          `${courseOutcome.id}:${programSpecificOutcome.id}`;

        const suggestion =
          suggestionMap.get(
            key
          );

        completeMatrix.push({
          courseOutcomeId:
            courseOutcome.id,

          courseOutcomeCode:
            courseOutcome.code,

          programSpecificOutcomeId:
            programSpecificOutcome.id,

          programSpecificOutcomeCode:
            programSpecificOutcome.code,

          mappingLevel:
            suggestion
              ? suggestion.mappingLevel
              : null,

          reason:
            suggestion
              ? suggestion.reason
              : "No meaningful CO-PSO relationship identified.",
        });
      }
    }

    // --------------------------------------------------------------
    // Return AI suggestions only.
    //
    // NO DATABASE WRITE.
    // --------------------------------------------------------------

    return {
      course: matrix.course,

      courseOutcomes:
        matrix.courseOutcomes,

      programSpecificOutcomes:
        matrix.programSpecificOutcomes,

      mappings:
        completeMatrix,

      aiGenerated: true,

      message:
        "CO-PSO mapping suggestions generated successfully. Review the suggestions before saving.",
    };
  }

  // ================================================================
  // SAVE CO–PSO MATRIX
  // ================================================================
  //
  // Only mappings with levels 1, 2, or 3 are stored.
  //
  // null / "-" mappings are NOT stored.
  //
  // ================================================================

  async saveMatrix(
    courseId,
    matrix
  ) {
    if (!courseId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Course ID is required."
      );
    }

    if (!Array.isArray(matrix)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Matrix must be an array."
      );
    }

    // --------------------------------------------------------------
    // Get current course matrix
    // --------------------------------------------------------------

    const courseMatrix =
      await repository.getMatrixData(
        courseId
      );

    if (!courseMatrix) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Course not found."
      );
    }

    // --------------------------------------------------------------
    // Valid CO IDs
    // --------------------------------------------------------------

    const validCourseOutcomeIds =
      new Set(
        courseMatrix.courseOutcomes.map(
          (co) => co.id
        )
      );

    // --------------------------------------------------------------
    // Valid PSO IDs
    // --------------------------------------------------------------

    const validPsoIds =
      new Set(
        courseMatrix.programSpecificOutcomes.map(
          (pso) => pso.id
        )
      );

    // --------------------------------------------------------------
    // Validate and clean matrix
    // --------------------------------------------------------------

    const cleanedMatrix = [];

    const pairSet =
      new Set();

    for (
      const item of matrix
    ) {
      if (!item) {
        continue;
      }

      const {
        courseOutcomeId,
        programSpecificOutcomeId,
        mappingLevel,
      } = item;

      // ------------------------------------------------------------
      // Skip unmapped cells
      // ------------------------------------------------------------

      if (
        mappingLevel === null ||
        mappingLevel === undefined ||
        mappingLevel === "" ||
        mappingLevel === "-"
      ) {
        continue;
      }

      // ------------------------------------------------------------
      // Validate CO
      // ------------------------------------------------------------

      if (
        !validCourseOutcomeIds.has(
          courseOutcomeId
        )
      ) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Invalid Course Outcome in CO-PSO matrix."
        );
      }

      // ------------------------------------------------------------
      // Validate PSO
      // ------------------------------------------------------------

      if (
        !validPsoIds.has(
          programSpecificOutcomeId
        )
      ) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Invalid Program Specific Outcome in CO-PSO matrix."
        );
      }

      // ------------------------------------------------------------
      // Convert mapping level
      // ------------------------------------------------------------

      const level =
        Number(mappingLevel);

      // ------------------------------------------------------------
      // Validate level
      //
      // ONLY:
      //
      // 1 = Low
      // 2 = Medium
      // 3 = High
      // ------------------------------------------------------------

      if (
        !Number.isInteger(level) ||
        level < 1 ||
        level > 3
      ) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Mapping level must be 1, 2, or 3."
        );
      }

      // ------------------------------------------------------------
      // Prevent duplicate pair
      // ------------------------------------------------------------

      const pair =
        `${courseOutcomeId}:${programSpecificOutcomeId}`;

      if (
        pairSet.has(pair)
      ) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Duplicate CO-PSO mapping detected."
        );
      }

      pairSet.add(pair);

      // ------------------------------------------------------------
      // Add clean database object
      // ------------------------------------------------------------

      cleanedMatrix.push({
        courseOutcomeId,

        programSpecificOutcomeId,

        mappingLevel: level,

        status: true,
      });
    }

    // --------------------------------------------------------------
    // Get all CO IDs belonging to this course
    // --------------------------------------------------------------

    const courseOutcomeIds =
      courseMatrix.courseOutcomes.map(
        (co) => co.id
      );

    // --------------------------------------------------------------
    // Save matrix
    // --------------------------------------------------------------

    await repository.saveMatrix(
      courseOutcomeIds,
      cleanedMatrix
    );

    // --------------------------------------------------------------
    // Return saved result
    // --------------------------------------------------------------

    return {
      courseId,

      savedCount:
        cleanedMatrix.length,

      mappings:
        cleanedMatrix,

      message:
        "CO-PSO Matrix saved successfully.",
    };
  }

  // ================================================================
  // UPDATE
  // ================================================================

  async update(
    id,
    data
  ) {
    const mapping =
      await repository.findById(
        id
      );

    if (!mapping) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "CO-PSO Mapping not found."
      );
    }

    // --------------------------------------------------------------
    // Check duplicate mapping
    // --------------------------------------------------------------

    const courseOutcomeId =
      data.courseOutcomeId ??
      mapping.courseOutcomeId;

    const programSpecificOutcomeId =
      data.programSpecificOutcomeId ??
      mapping.programSpecificOutcomeId;

    const existing =
      await repository.findExistingMapping(
        courseOutcomeId,
        programSpecificOutcomeId
      );

    if (
      existing &&
      existing.id !== id
    ) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "CO-PSO Mapping already exists."
      );
    }

    // --------------------------------------------------------------
    // Validate mapping level
    // --------------------------------------------------------------

    if (
      data.mappingLevel !==
        undefined &&
      data.mappingLevel !== null
    ) {
      const level =
        Number(
          data.mappingLevel
        );

      if (
        !Number.isInteger(level) ||
        level < 1 ||
        level > 3
      ) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Mapping level must be 1, 2, or 3."
        );
      }
    }

    return await repository.update(
      mapping,
      data
    );
  }

  // ================================================================
  // DELETE
  // ================================================================

  async remove(id) {
    const mapping =
      await repository.findById(
        id
      );

    if (!mapping) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "CO-PSO Mapping not found."
      );
    }

    await repository.remove(
      mapping
    );

    return {
      message:
        "CO-PSO Mapping deleted successfully.",
    };
  }
}

export default new CoPsoMappingService();