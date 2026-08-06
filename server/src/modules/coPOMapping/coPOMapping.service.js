import coPOMappingRepository from "./coPOMapping.repository.js";
import courseOutcomeRepository from "../co/co.repository.js";
import programOutcomeRepository from "../programOutcome/programOutcome.repository.js";

/**
 * ------------------------------------------------------------------
 * Create CO-PO Mapping
 * ------------------------------------------------------------------
 */
const createMapping = async (data) => {
  const { courseOutcomeId, programOutcomeId } = data;

  const courseOutcome = await courseOutcomeRepository.findById(courseOutcomeId);

  if (!courseOutcome) {
    throw new Error("Course Outcome not found.");
  }

  const programOutcome =
    await programOutcomeRepository.findById(programOutcomeId);

  if (!programOutcome) {
    throw new Error("Program Outcome not found.");
  }

  const existingMapping =
    await coPOMappingRepository.findExistingMapping(
      courseOutcomeId,
      programOutcomeId
    );

  if (existingMapping) {
    throw new Error("CO-PO Mapping already exists.");
  }

  return await coPOMappingRepository.create(data);
};

/**
 * ------------------------------------------------------------------
 * Get All CO-PO Mappings
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
  const mapping = await coPOMappingRepository.findById(id);

  if (!mapping) {
    throw new Error("CO-PO Mapping not found.");
  }

  return mapping;
};

/**
 * ------------------------------------------------------------------
 * Get Mappings By Course Outcome
 * ------------------------------------------------------------------
 */
const getMappingsByCourseOutcome = async (courseOutcomeId) => {
  return await coPOMappingRepository.findByCourseOutcomeId(courseOutcomeId);
};

/**
 * ------------------------------------------------------------------
 * Get Mappings By Program Outcome
 * ------------------------------------------------------------------
 */
const getMappingsByProgramOutcome = async (programOutcomeId) => {
  return await coPOMappingRepository.findByProgramOutcomeId(programOutcomeId);
};

/**
 * ------------------------------------------------------------------
 * Get NBA Matrix
 * ------------------------------------------------------------------
 */
const getMatrix = async (courseId) => {
  const matrix = await coPOMappingRepository.getMatrixData(courseId);

  if (!matrix) {
    throw new Error("Course not found.");
  }

  return matrix;
};

/**
 * ------------------------------------------------------------------
 * Save NBA Matrix
 * ------------------------------------------------------------------
 */
const saveMatrix = async (matrix) => {
  if (!Array.isArray(matrix)) {
    throw new Error("Invalid matrix data.");
  }

  for (const row of matrix) {
    if (
      !row.courseOutcomeId ||
      !row.programOutcomeId ||
      row.mappingLevel === undefined
    ) {
      throw new Error("Invalid matrix row.");
    }

    if (row.mappingLevel < 0 || row.mappingLevel > 3) {
      throw new Error("Mapping level must be between 0 and 3.");
    }
  }

  await coPOMappingRepository.saveMatrix(matrix);

  return {
    success: true,
    message: "CO-PO Matrix saved successfully.",
  };
};

/**
 * ------------------------------------------------------------------
 * Update Mapping
 * ------------------------------------------------------------------
 */
const updateMapping = async (id, data) => {
  const mapping = await coPOMappingRepository.findById(id);

  if (!mapping) {
    throw new Error("CO-PO Mapping not found.");
  }

  return await coPOMappingRepository.update(mapping, data);
};

/**
 * ------------------------------------------------------------------
 * Delete Mapping
 * ------------------------------------------------------------------
 */
const deleteMapping = async (id) => {
  const mapping = await coPOMappingRepository.findById(id);

  if (!mapping) {
    throw new Error("CO-PO Mapping not found.");
  }

  await coPOMappingRepository.remove(mapping);

  return {
    message: "CO-PO Mapping deleted successfully.",
  };
};

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
};