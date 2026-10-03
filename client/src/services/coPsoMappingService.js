/**
 * ------------------------------------------------------------------
 * CO–PSO Mapping Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Handles all CO–PSO Mapping API communication.
 * ------------------------------------------------------------------
 */

import api from "../api/axios";

/**
 * ------------------------------------------------------------------
 * Get CO–PSO Matrix
 * ------------------------------------------------------------------
 *
 * GET /api/v1/co-pso-mappings/matrix/:courseId
 *
 * Returns:
 *
 * {
 *   course,
 *   courseOutcomes,
 *   programSpecificOutcomes,
 *   mappings
 * }
 * ------------------------------------------------------------------
 */

export const getCoPsoMatrix = async (
  courseId
) => {
  const response = await api.get(
    `/co-pso-mappings/matrix/${courseId}`
  );

  return (
    response?.data?.data ??
    null
  );
};

/**
 * ------------------------------------------------------------------
 * AUTOMATED CO–PSO MAPPING
 * ------------------------------------------------------------------
 *
 * GET /api/v1/co-pso-mappings/automate/:courseId
 *
 * Gemini analyzes:
 *
 * CO descriptions
 *        +
 * PSO descriptions
 *        ↓
 * AI-generated mapping suggestions
 *
 * Mapping levels:
 *
 * 1 = Low
 * 2 = Medium
 * 3 = High
 * null = No meaningful mapping
 *
 * IMPORTANT:
 *
 * This endpoint ONLY generates suggestions.
 * It does NOT save them to the database.
 *
 * Faculty must review the suggestions
 * before saving the matrix.
 * ------------------------------------------------------------------
 */

export const automateCoPsoMapping =
  async (courseId) => {
    const response =
      await api.get(
        `/co-pso-mappings/automate/${courseId}`
      );

    return (
      response?.data?.data ??
      null
    );
  };

/**
 * ------------------------------------------------------------------
 * Save CO–PSO Matrix
 * ------------------------------------------------------------------
 *
 * POST /api/v1/co-pso-mappings/matrix
 *
 * Only actual mappings are stored.
 *
 * 1 = Low
 * 2 = Medium
 * 3 = High
 *
 * Unmapped cells are displayed as "-"
 * and are not stored in the database.
 * ------------------------------------------------------------------
 */

export const saveCoPsoMatrix =
  async (
    courseId,
    matrix
  ) => {
    const response =
      await api.post(
        "/co-pso-mappings/matrix",
        {
          courseId,
          matrix,
        }
      );

    return (
      response?.data ??
      null
    );
  };

/**
 * ------------------------------------------------------------------
 * Get All CO–PSO Mappings
 * ------------------------------------------------------------------
 */

export const getCoPsoMappings =
  async () => {
    const response =
      await api.get(
        "/co-pso-mappings"
      );

    return (
      response?.data?.data ??
      []
    );
  };

/**
 * ------------------------------------------------------------------
 * Get CO–PSO Mapping By ID
 * ------------------------------------------------------------------
 */

export const getCoPsoMapping =
  async (id) => {
    const response =
      await api.get(
        `/co-pso-mappings/${id}`
      );

    return (
      response?.data?.data ??
      null
    );
  };

/**
 * ------------------------------------------------------------------
 * Get Mappings By Course Outcome
 * ------------------------------------------------------------------
 */

export const getCoPsoMappingsByCourseOutcome =
  async (
    courseOutcomeId
  ) => {
    const response =
      await api.get(
        `/co-pso-mappings/course-outcome/${courseOutcomeId}`
      );

    return (
      response?.data?.data ??
      []
    );
  };

/**
 * ------------------------------------------------------------------
 * Get Mappings By Program Specific Outcome
 * ------------------------------------------------------------------
 */

export const getCoPsoMappingsByPso =
  async (
    programSpecificOutcomeId
  ) => {
    const response =
      await api.get(
        `/co-pso-mappings/program-specific-outcome/${programSpecificOutcomeId}`
      );

    return (
      response?.data?.data ??
      []
    );
  };

/**
 * ------------------------------------------------------------------
 * Create CO–PSO Mapping
 * ------------------------------------------------------------------
 */

export const createCoPsoMapping =
  async (data) => {
    const response =
      await api.post(
        "/co-pso-mappings",
        data
      );

    return (
      response?.data ??
      null
    );
  };

/**
 * ------------------------------------------------------------------
 * Update CO–PSO Mapping
 * ------------------------------------------------------------------
 */

export const updateCoPsoMapping =
  async (
    id,
    data
  ) => {
    const response =
      await api.put(
        `/co-pso-mappings/${id}`,
        data
      );

    return (
      response?.data ??
      null
    );
  };

/**
 * ------------------------------------------------------------------
 * Delete CO–PSO Mapping
 * ------------------------------------------------------------------
 */

export const deleteCoPsoMapping =
  async (id) => {
    const response =
      await api.delete(
        `/co-pso-mappings/${id}`
      );

    return (
      response?.data ??
      null
    );
  };