/**
 * ------------------------------------------------------------------
 * CO–PO Mapping Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Handles:
 *
 * - Manual CO–PO mapping
 * - CO–PO matrix retrieval
 * - CO–PO matrix saving
 * - Automated AI-based CO–PO mapping
 *
 * Mapping Level:
 *
 * 1 = Low
 * 2 = Medium
 * 3 = High
 *
 * IMPORTANT:
 *
 * Level 0 is NOT allowed anywhere in the system.
 * Automated mapping does NOT directly save to database.
 * Faculty must review the generated suggestions first.
 * ------------------------------------------------------------------
 */

import coPOMappingRepository from "./coPOMapping.repository.js";

import courseOutcomeRepository from "../co/co.repository.js";

import programOutcomeRepository from "../programOutcome/programOutcome.repository.js";

import coPOMappingAIService from "./coPOMapping.ai.service.js";


/**
 * ------------------------------------------------------------------
 * Validate Mapping Level
 * ------------------------------------------------------------------
 */
const validateMappingLevel = (mappingLevel) => {
  if (
    !Number.isInteger(mappingLevel) ||
    mappingLevel < 1 ||
    mappingLevel > 3
  ) {
    throw new Error(
      "Mapping level must be between 1 and 3."
    );
  }

  return true;
};


/**
 * ------------------------------------------------------------------
 * Create CO–PO Mapping
 * ------------------------------------------------------------------
 */
const createMapping = async (data) => {
  const {
    courseOutcomeId,
    programOutcomeId,
    mappingLevel,
  } = data;

  /**
   * Validate mapping level
   */
  validateMappingLevel(mappingLevel);

  /**
   * Check Course Outcome
   */
  const courseOutcome =
    await courseOutcomeRepository.findById(
      courseOutcomeId
    );

  if (!courseOutcome) {
    throw new Error(
      "Course Outcome not found."
    );
  }

  /**
   * Check Program Outcome
   */
  const programOutcome =
    await programOutcomeRepository.findById(
      programOutcomeId
    );

  if (!programOutcome) {
    throw new Error(
      "Program Outcome not found."
    );
  }

  /**
   * Check duplicate mapping
   */
  const existingMapping =
    await coPOMappingRepository.findExistingMapping(
      courseOutcomeId,
      programOutcomeId
    );

  if (existingMapping) {
    throw new Error(
      "CO-PO Mapping already exists."
    );
  }

  return await coPOMappingRepository.create(
    data
  );
};


/**
 * ------------------------------------------------------------------
 * Get All CO–PO Mappings
 * ------------------------------------------------------------------
 */
const getMappings = async () => {
  return await coPOMappingRepository.findAll();
};


/**
 * ------------------------------------------------------------------
 * Get Mapping By ID
 * ------------------------------------------------------------------
 */
const getMappingById = async (id) => {
  const mapping =
    await coPOMappingRepository.findById(id);

  if (!mapping) {
    throw new Error(
      "CO-PO Mapping not found."
    );
  }

  return mapping;
};


/**
 * ------------------------------------------------------------------
 * Get Mappings By Course Outcome
 * ------------------------------------------------------------------
 */
const getMappingsByCourseOutcome = async (
  courseOutcomeId
) => {
  return await coPOMappingRepository.findByCourseOutcomeId(
    courseOutcomeId
  );
};


/**
 * ------------------------------------------------------------------
 * Get Mappings By Program Outcome
 * ------------------------------------------------------------------
 */
const getMappingsByProgramOutcome = async (
  programOutcomeId
) => {
  return await coPOMappingRepository.findByProgramOutcomeId(
    programOutcomeId
  );
};


/**
 * ------------------------------------------------------------------
 * Get CO–PO Matrix
 * ------------------------------------------------------------------
 */
const getMatrix = async (courseId) => {
  const matrix =
    await coPOMappingRepository.getMatrixData(
      courseId
    );

  if (!matrix) {
    throw new Error(
      "Course not found."
    );
  }

  return matrix;
};


/**
 * ------------------------------------------------------------------
 * Save CO–PO Matrix
 * ------------------------------------------------------------------
 *
 * IMPORTANT:
 *
 * Only mapping levels 1, 2 and 3 are accepted.
 *
 * Level 0 is rejected.
 * ------------------------------------------------------------------
 */
const saveMatrix = async (matrix) => {
  if (!Array.isArray(matrix)) {
    throw new Error(
      "Invalid matrix data."
    );
  }

  if (matrix.length === 0) {
    throw new Error(
      "Matrix cannot be empty."
    );
  }

  for (const row of matrix) {

    if (
      !row.courseOutcomeId ||
      !row.programOutcomeId ||
      row.mappingLevel === undefined
    ) {
      throw new Error(
        "Invalid matrix row."
      );
    }

    validateMappingLevel(
      row.mappingLevel
    );
  }

  await coPOMappingRepository.saveMatrix(
    matrix
  );

  return {
    success: true,
    message:
      "CO-PO Matrix saved successfully.",
  };
};


/**
 * ------------------------------------------------------------------
 * Update CO–PO Mapping
 * ------------------------------------------------------------------
 */
const updateMapping = async (
  id,
  data
) => {

  if (
    data.mappingLevel !== undefined
  ) {
    validateMappingLevel(
      data.mappingLevel
    );
  }

  const mapping =
    await coPOMappingRepository.findById(id);

  if (!mapping) {
    throw new Error(
      "CO-PO Mapping not found."
    );
  }

  return await coPOMappingRepository.update(
    mapping,
    data
  );
};


/**
 * ------------------------------------------------------------------
 * Delete CO–PO Mapping
 * ------------------------------------------------------------------
 */
const deleteMapping = async (id) => {
  const mapping =
    await coPOMappingRepository.findById(id);

  if (!mapping) {
    throw new Error(
      "CO-PO Mapping not found."
    );
  }

  await coPOMappingRepository.remove(
    mapping
  );

  return {
    message:
      "CO-PO Mapping deleted successfully.",
  };
};


/**
 * ------------------------------------------------------------------
 * AUTOMATED CO–PO MAPPING
 * ------------------------------------------------------------------
 *
 * Flow:
 *
 * Course
 *    ↓
 * Course Outcomes
 *    ↓
 * Program Outcomes
 *    ↓
 * AI Analysis
 *    ↓
 * Suggested CO–PO Mapping
 *    ↓
 * Faculty Review
 *    ↓
 * Save Matrix
 *
 * IMPORTANT:
 *
 * This method DOES NOT save the generated
 * suggestions directly to the database.
 *
 * Level 0 is never returned.
 * ------------------------------------------------------------------
 */
const automateMapping = async (
  courseId
) => {

  /**
   * --------------------------------------------------------------
   * Get Course + COs + POs
   * --------------------------------------------------------------
   */
  const matrix =
    await coPOMappingRepository.getMatrixData(
      courseId
    );

  if (!matrix) {
    throw new Error(
      "Course not found."
    );
  }

  /**
   * --------------------------------------------------------------
   * Validate Course Outcomes
   * --------------------------------------------------------------
   */
  if (
    !matrix.courseOutcomes ||
    matrix.courseOutcomes.length === 0
  ) {
    throw new Error(
      "No Course Outcomes found for this course."
    );
  }

  /**
   * --------------------------------------------------------------
   * Validate Program Outcomes
   * --------------------------------------------------------------
   */
  if (
    !matrix.programOutcomes ||
    matrix.programOutcomes.length === 0
  ) {
    throw new Error(
      "No Program Outcomes found for this program."
    );
  }

  /**
   * --------------------------------------------------------------
   * Send data to AI service
   * --------------------------------------------------------------
   */
  const suggestions =
    await coPOMappingAIService.generateMapping(
      {
        course: matrix.course,

        courseOutcomes:
          matrix.courseOutcomes,

        programOutcomes:
          matrix.programOutcomes,
      }
    );

  /**
   * --------------------------------------------------------------
   * Validate AI Response
   * --------------------------------------------------------------
   *
   * We never allow AI to introduce:
   *
   * 0
   * negative values
   * values greater than 3
   * decimal values
   *
   * Valid:
   *
   * 1 = Low
   * 2 = Medium
   * 3 = High
   */
  const validatedSuggestions =
    Array.isArray(suggestions)
      ? suggestions.map((suggestion) => {

          const mappingLevel =
            Number(
              suggestion.mappingLevel
            );

          if (
            !Number.isInteger(
              mappingLevel
            ) ||
            mappingLevel < 1 ||
            mappingLevel > 3
          ) {
            throw new Error(
              "Automated mapping generated an invalid mapping level. Only levels 1, 2 and 3 are allowed."
            );
          }

          return {
            ...suggestion,
            mappingLevel,
          };
        })
      : suggestions;

  /**
   * --------------------------------------------------------------
   * Return suggestions
   * --------------------------------------------------------------
   */
  return {
    courseId,

    course:
      matrix.course,

    courseOutcomes:
      matrix.courseOutcomes,

    programOutcomes:
      matrix.programOutcomes,

    suggestions:
      validatedSuggestions,

    mappingScale: {
      1: "Low",
      2: "Medium",
      3: "High",
    },

    saved: false,
  };
};


/**
 * ------------------------------------------------------------------
 * Export Service
 * ------------------------------------------------------------------
 */
export default {
  createMapping,

  getMappings,

  getMappingById,

  getMappingsByCourseOutcome,

  getMappingsByProgramOutcome,

  getMatrix,

  saveMatrix,

  updateMapping,

  deleteMapping,

  automateMapping,
};