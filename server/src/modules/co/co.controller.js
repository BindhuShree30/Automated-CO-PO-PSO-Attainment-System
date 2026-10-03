/**
 * ------------------------------------------------------------------
 * Course Outcome Controller
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import coService from "./co.service.js";

/**
 * ------------------------------------------------------------------
 * Create Course Outcome
 * ------------------------------------------------------------------
 */
const createCO = async (req, res, next) => {
  try {
    const co =
      await coService.createCO(
        req.validatedData.body,
        req.user
      );

    res.status(201).json({
      success: true,
      message:
        "Course Outcome created successfully.",
      data: co,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ------------------------------------------------------------------
 * Get All Course Outcomes
 * ------------------------------------------------------------------
 */
const getCOs = async (
  req,
  res,
  next
) => {
  try {
    const cos =
      await coService.getCOs();

    res.status(200).json({
      success: true,
      message:
        "Course Outcomes fetched successfully.",
      data: cos,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ------------------------------------------------------------------
 * Get Course Outcome By ID
 * ------------------------------------------------------------------
 */
const getCOById = async (
  req,
  res,
  next
) => {
  try {
    const { id } =
      req.validatedData.params;

    const co =
      await coService.getCOById(id);

    res.status(200).json({
      success: true,
      message:
        "Course Outcome fetched successfully.",
      data: co,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ------------------------------------------------------------------
 * Get Course Outcomes By Course
 * ------------------------------------------------------------------
 */
const getCOsByCourse = async (
  req,
  res,
  next
) => {
  try {
    const { courseId } =
      req.validatedData.params;

    const cos =
      await coService.getCOsByCourse(
        courseId,
        req.user
      );

    res.status(200).json({
      success: true,
      message:
        "Course Outcomes fetched successfully.",
      data: cos,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ------------------------------------------------------------------
 * Update Course Outcome
 * ------------------------------------------------------------------
 */
const updateCO = async (
  req,
  res,
  next
) => {
  try {
    const { id } =
      req.validatedData.params;

    const co =
      await coService.updateCO(
        id,
        req.validatedData.body,
        req.user
      );

    res.status(200).json({
      success: true,
      message:
        "Course Outcome updated successfully.",
      data: co,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ------------------------------------------------------------------
 * Delete Course Outcome
 * ------------------------------------------------------------------
 */
const deleteCO = async (
  req,
  res,
  next
) => {
  try {
    const { id } =
      req.validatedData.params;

    const result =
      await coService.deleteCO(
        id,
        req.user
      );

    res.status(200).json({
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
 * Export
 * ------------------------------------------------------------------
 */
export default {
  createCO,
  getCOs,
  getCOById,
  getCOsByCourse,
  updateCO,
  deleteCO,
};