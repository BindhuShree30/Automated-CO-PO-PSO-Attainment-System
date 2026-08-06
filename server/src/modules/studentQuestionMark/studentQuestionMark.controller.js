/**
 * ------------------------------------------------------------------
 * Student Question Mark Controller
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import studentQuestionMarkService from "./studentQuestionMark.service.js";
import asyncHandler from "../../shared/helpers/asyncHandler.js";
import {
  successResponse,
} from "../../shared/helpers/apiResponse.js";

/**
 * Create Student Question Mark
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
 * Get All Student Question Marks
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
 * Get Student Question Mark By ID
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
 * Get Marks By Student
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
 * Get Marks By Assessment Question
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
  updateStudentQuestionMark,
  deleteStudentQuestionMark,
};