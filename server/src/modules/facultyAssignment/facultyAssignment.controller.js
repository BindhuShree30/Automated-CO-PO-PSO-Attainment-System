/**
 * ------------------------------------------------------------------
 * Faculty Assignment Controller
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import facultyAssignmentService from "./facultyAssignment.service.js";

/**
 * ------------------------------------------------------------------
 * Create
 * ------------------------------------------------------------------
 */

const createAssignment = async (
  req,
  res,
  next
) => {
  try {
    const assignment =
      await facultyAssignmentService.createAssignment(
        req.validatedData.body
      );

    return res.status(201).json({
      success: true,
      message:
        "Faculty assigned successfully.",
      data: assignment,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ------------------------------------------------------------------
 * Get All
 * ------------------------------------------------------------------
 */

const getAllAssignments = async (
  req,
  res,
  next
) => {
  try {
    const assignments =
      await facultyAssignmentService.getAllAssignments();

    return res.status(200).json({
      success: true,
      message:
        "Faculty assignments fetched successfully.",
      data: assignments,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ------------------------------------------------------------------
 * Get By ID
 * ------------------------------------------------------------------
 */

const getAssignmentById = async (
  req,
  res,
  next
) => {
  try {
    const {
      id,
    } = req.validatedData.params;

    const assignment =
      await facultyAssignmentService.getAssignmentById(
        id
      );

    return res.status(200).json({
      success: true,
      message:
        "Faculty assignment fetched successfully.",
      data: assignment,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ------------------------------------------------------------------
 * Get My Courses
 * ------------------------------------------------------------------
 */

const getMyCourses = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authenticated user not found.",
        data: null,
        error: null,
      });
    }

    const courses =
      await facultyAssignmentService.getMyCourses(
        userId
      );

    return res.status(200).json({
      success: true,
      message:
        "Faculty courses fetched successfully.",
      data: courses,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ------------------------------------------------------------------
 * Update
 * ------------------------------------------------------------------
 */

const updateAssignment = async (
  req,
  res,
  next
) => {
  try {
    const {
      id,
    } = req.validatedData.params;

    const assignment =
      await facultyAssignmentService.updateAssignment(
        id,
        req.validatedData.body
      );

    return res.status(200).json({
      success: true,
      message:
        "Faculty assignment updated successfully.",
      data: assignment,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ------------------------------------------------------------------
 * Delete
 * ------------------------------------------------------------------
 */

const deleteAssignment = async (
  req,
  res,
  next
) => {
  try {
    const {
      id,
    } = req.validatedData.params;

    await facultyAssignmentService.deleteAssignment(
      id
    );

    return res.status(200).json({
      success: true,
      message:
        "Faculty assignment deleted successfully.",
      data: null,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
  getMyCourses,
  updateAssignment,
  deleteAssignment,
};