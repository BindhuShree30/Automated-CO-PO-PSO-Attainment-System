/**
 * ------------------------------------------------------------------
 * CO–PO Mapping Controller
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import coPOMappingService from "./coPOMapping.service.js";


/**
 * ------------------------------------------------------------------
 * Create CO–PO Mapping
 * ------------------------------------------------------------------
 */
const createMapping = async (
  req,
  res,
  next
) => {
  try {

    const mapping =
      await coPOMappingService.createMapping(
        req.validatedData.body
      );

    return res.status(201).json({
      success: true,
      message:
        "CO-PO Mapping created successfully.",
      data: mapping,
      error: null,
    });

  } catch (error) {
    next(error);
  }
};


/**
 * ------------------------------------------------------------------
 * Get All CO–PO Mappings
 * ------------------------------------------------------------------
 */
const getMappings = async (
  req,
  res,
  next
) => {
  try {

    const mappings =
      await coPOMappingService.getMappings();

    return res.status(200).json({
      success: true,
      message:
        "CO-PO Mappings fetched successfully.",
      data: mappings,
      error: null,
    });

  } catch (error) {
    next(error);
  }
};


/**
 * ------------------------------------------------------------------
 * Get Mapping By ID
 * ------------------------------------------------------------------
 */
const getMappingById = async (
  req,
  res,
  next
) => {
  try {

    const { id } =
      req.validatedData.params;

    const mapping =
      await coPOMappingService.getMappingById(
        id
      );

    return res.status(200).json({
      success: true,
      message:
        "CO-PO Mapping fetched successfully.",
      data: mapping,
      error: null,
    });

  } catch (error) {
    next(error);
  }
};


/**
 * ------------------------------------------------------------------
 * Get Mappings By Course Outcome
 * ------------------------------------------------------------------
 */
const getMappingsByCourseOutcome = async (
  req,
  res,
  next
) => {
  try {

    const { courseOutcomeId } =
      req.validatedData.params;

    const mappings =
      await coPOMappingService
        .getMappingsByCourseOutcome(
          courseOutcomeId
        );

    return res.status(200).json({
      success: true,
      message:
        "CO-PO Mappings fetched successfully.",
      data: mappings,
      error: null,
    });

  } catch (error) {
    next(error);
  }
};


/**
 * ------------------------------------------------------------------
 * Get Mappings By Program Outcome
 * ------------------------------------------------------------------
 */
const getMappingsByProgramOutcome = async (
  req,
  res,
  next
) => {
  try {

    const { programOutcomeId } =
      req.validatedData.params;

    const mappings =
      await coPOMappingService
        .getMappingsByProgramOutcome(
          programOutcomeId
        );

    return res.status(200).json({
      success: true,
      message:
        "CO-PO Mappings fetched successfully.",
      data: mappings,
      error: null,
    });

  } catch (error) {
    next(error);
  }
};


/**
 * ------------------------------------------------------------------
 * Get CO–PO Matrix
 * ------------------------------------------------------------------
 */
const getMatrix = async (
  req,
  res,
  next
) => {
  try {

    const { courseId } =
      req.validatedData.params;

    const matrix =
      await coPOMappingService.getMatrix(
        courseId
      );

    return res.status(200).json({
      success: true,
      message:
        "CO-PO Matrix fetched successfully.",
      data: matrix,
      error: null,
    });

  } catch (error) {
    next(error);
  }
};


/**
 * ------------------------------------------------------------------
 * Save CO–PO Matrix
 * ------------------------------------------------------------------
 */
const saveMatrix = async (
  req,
  res,
  next
) => {
  try {

    const result =
      await coPOMappingService.saveMatrix(
        req.validatedData.body.matrix
      );

    return res.status(200).json({
      success: true,
      message:
        result.message,
      data: null,
      error: null,
    });

  } catch (error) {
    next(error);
  }
};


/**
 * ------------------------------------------------------------------
 * AUTOMATED CO–PO MAPPING
 * ------------------------------------------------------------------
 *
 * POST /api/v1/co-po-mappings/automate
 *
 * Generates AI-based CO–PO mapping suggestions.
 *
 * IMPORTANT:
 *
 * Suggestions are NOT saved automatically.
 *
 * Faculty reviews them first.
 * ------------------------------------------------------------------
 */
const automateMapping = async (
  req,
  res,
  next
) => {
  try {

    const { courseId } =
      req.validatedData.body;

    const result =
      await coPOMappingService
        .automateMapping(
          courseId
        );

    return res.status(200).json({
      success: true,
      message:
        "Automated CO-PO mapping generated successfully.",
      data: result,
      error: null,
    });

  } catch (error) {
    next(error);
  }
};


/**
 * ------------------------------------------------------------------
 * Update CO–PO Mapping
 * ------------------------------------------------------------------
 */
const updateMapping = async (
  req,
  res,
  next
) => {
  try {

    const { id } =
      req.validatedData.params;

    const mapping =
      await coPOMappingService.updateMapping(
        id,
        req.validatedData.body
      );

    return res.status(200).json({
      success: true,
      message:
        "CO-PO Mapping updated successfully.",
      data: mapping,
      error: null,
    });

  } catch (error) {
    next(error);
  }
};


/**
 * ------------------------------------------------------------------
 * Delete CO–PO Mapping
 * ------------------------------------------------------------------
 */
const deleteMapping = async (
  req,
  res,
  next
) => {
  try {

    const { id } =
      req.validatedData.params;

    const result =
      await coPOMappingService.deleteMapping(
        id
      );

    return res.status(200).json({
      success: true,
      message:
        result.message,
      data: null,
      error: null,
    });

  } catch (error) {
    next(error);
  }
};


/**
 * ------------------------------------------------------------------
 * Export Controller
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

  automateMapping,

  updateMapping,

  deleteMapping,

};