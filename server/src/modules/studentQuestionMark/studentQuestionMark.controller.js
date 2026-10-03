import studentQuestionMarkService from "./studentQuestionMark.service.js";
import asyncHandler from "../../shared/helpers/asyncHandler.js";
import { successResponse } from "../../shared/helpers/apiResponse.js";

/**
 * Create one Student Question Mark
 */
const createStudentQuestionMark = asyncHandler(
  async (req, res) => {
    const studentQuestionMark =
      await studentQuestionMarkService.createStudentQuestionMark(
        req.validatedData.body
      );

    return successResponse(
      res,
      "Student Question Mark created successfully.",
      studentQuestionMark,
      201
    );
  }
);

/**
 * Get all Student Question Marks
 */
const getStudentQuestionMarks = asyncHandler(
  async (req, res) => {
    const studentQuestionMarks =
      await studentQuestionMarkService.getStudentQuestionMarks();

    return successResponse(
      res,
      "Student Question Marks fetched successfully.",
      studentQuestionMarks
    );
  }
);

/**
 * Get Student Question Mark by ID
 */
const getStudentQuestionMarkById = asyncHandler(
  async (req, res) => {
    const studentQuestionMark =
      await studentQuestionMarkService.getStudentQuestionMarkById(
        req.params.id
      );

    return successResponse(
      res,
      "Student Question Mark fetched successfully.",
      studentQuestionMark
    );
  }
);

/**
 * Get all marks by Student ID
 */
const getMarksByStudentId = asyncHandler(
  async (req, res) => {
    const studentQuestionMarks =
      await studentQuestionMarkService.getMarksByStudentId(
        req.params.studentId
      );

    return successResponse(
      res,
      "Student Question Marks fetched successfully.",
      studentQuestionMarks
    );
  }
);

/**
 * Get all marks by Assessment Question ID
 */
const getMarksByAssessmentQuestionId = asyncHandler(
  async (req, res) => {
    const studentQuestionMarks =
      await studentQuestionMarkService.getMarksByAssessmentQuestionId(
        req.params.assessmentQuestionId
      );

    return successResponse(
      res,
      "Assessment Question Marks fetched successfully.",
      studentQuestionMarks
    );
  }
);

/**
 * Get marks for one Student in one Assessment
 *
 * GET
 * /assessment/:assessmentId/student/:studentId
 */
const getMarksByAssessmentAndStudent = asyncHandler(
  async (req, res) => {
    const marks =
      await studentQuestionMarkService.getMarksByAssessmentAndStudent(
        req.params.assessmentId,
        req.params.studentId
      );

    return successResponse(
      res,
      "Student assessment marks fetched successfully.",
      marks
    );
  }
);

/**
 * Save marks for one Student in one Assessment
 *
 * POST
 * /assessment/:assessmentId/student/:studentId/bulk
 */
const saveBulkStudentMarks = asyncHandler(
  async (req, res) => {
    const result =
      await studentQuestionMarkService.saveBulkStudentMarks(
        req.params.assessmentId,
        req.params.studentId,
        req.validatedData.body
      );

    return successResponse(
      res,
      "Student assessment marks saved successfully.",
      result
    );
  }
);

/**
 * Update Student Question Mark
 */
const updateStudentQuestionMark = asyncHandler(
  async (req, res) => {
    const studentQuestionMark =
      await studentQuestionMarkService.updateStudentQuestionMark(
        req.params.id,
        req.validatedData.body
      );

    return successResponse(
      res,
      "Student Question Mark updated successfully.",
      studentQuestionMark
    );
  }
);

/**
 * Delete Student Question Mark
 */
const deleteStudentQuestionMark = asyncHandler(
  async (req, res) => {
    await studentQuestionMarkService.deleteStudentQuestionMark(
      req.params.id
    );

    return successResponse(
      res,
      "Student Question Mark deleted successfully.",
      null
    );
  }
);

export default {
  createStudentQuestionMark,
  getStudentQuestionMarks,
  getStudentQuestionMarkById,
  getMarksByStudentId,
  getMarksByAssessmentQuestionId,
  getMarksByAssessmentAndStudent,
  saveBulkStudentMarks,
  updateStudentQuestionMark,
  deleteStudentQuestionMark,
};