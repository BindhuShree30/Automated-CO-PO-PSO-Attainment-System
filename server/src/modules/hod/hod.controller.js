/**
 * ---------------------------------------------------------
 * HOD Controller
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ---------------------------------------------------------
 */

import hodService from "./hod.service.js";

/**
 * ---------------------------------------------------------
 * Get Pending Faculty
 * GET /api/v1/hod/faculty/pending
 * ---------------------------------------------------------
 */
const getPendingFaculty = async (req, res, next) => {
  try {
    const faculty = await hodService.getPendingFaculty();

    return res.status(200).json({
      success: true,
      message: "Pending faculty fetched successfully.",
      data: faculty,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ---------------------------------------------------------
 * Get All Faculty
 * GET /api/v1/hod/faculty
 * ---------------------------------------------------------
 */
const getAllFaculty = async (req, res, next) => {
  try {
    const faculty = await hodService.getAllFaculty();

    return res.status(200).json({
      success: true,
      message: "Faculty fetched successfully.",
      data: faculty,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ---------------------------------------------------------
 * Get Faculty By ID
 * GET /api/v1/hod/faculty/:id
 * ---------------------------------------------------------
 */
const getFacultyById = async (req, res, next) => {
  try {
    const faculty = await hodService.getFacultyById(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Faculty fetched successfully.",
      data: faculty,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ---------------------------------------------------------
 * Approve Faculty
 * PATCH /api/v1/hod/faculty/:id/approve
 * ---------------------------------------------------------
 */
const approveFaculty = async (req, res, next) => {
  try {
    const faculty = await hodService.approveFaculty(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Faculty approved successfully.",
      data: faculty,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ---------------------------------------------------------
 * Reject Faculty
 * PATCH /api/v1/hod/faculty/:id/reject
 * ---------------------------------------------------------
 */
const rejectFaculty = async (req, res, next) => {
  try {
    const faculty = await hodService.rejectFaculty(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Faculty rejected successfully.",
      data: faculty,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ---------------------------------------------------------
 * Change Faculty Status
 * PATCH /api/v1/hod/faculty/:id/status
 * ---------------------------------------------------------
 */
const changeFacultyStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const faculty =
      await hodService.changeFacultyStatus(
        req.params.id,
        status
      );

    return res.status(200).json({
      success: true,
      message: "Faculty status updated successfully.",
      data: faculty,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getPendingFaculty,
  getAllFaculty,
  getFacultyById,
  approveFaculty,
  rejectFaculty,
  changeFacultyStatus,
};