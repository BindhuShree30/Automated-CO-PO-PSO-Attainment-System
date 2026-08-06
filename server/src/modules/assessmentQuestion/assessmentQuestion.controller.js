/**
 * ------------------------------------------------------------------
 * Assessment Question Controller
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import assessmentQuestionService from "./assessmentQuestion.service.js";
import asyncHandler from "../../shared/helpers/asyncHandler.js";
import { successResponse } from "../../shared/helpers/apiResponse.js";

/**
 * Create Assessment Question
 */
const createAssessmentQuestion = asyncHandler(
  async (req, res) => {
    const assessmentQuestion =
      await assessmentQuestionService
        .createAssessmentQuestion(
          req.validatedData.body
        );

    return successResponse(
      res,
      "Assessment Question created successfully.",
      assessmentQuestion,
      201
    );
  }
);

/**
 * Get All Assessment Questions
 */
const getAssessmentQuestions = asyncHandler(
  async (req, res) => {
    const assessmentQuestions =
      await assessmentQuestionService
        .getAssessmentQuestions();

    return successResponse(
      res,
      "Assessment Questions fetched successfully.",
      assessmentQuestions,
      200
    );
  }
);

/**
 * Get Assessment Question By ID
 */
const getAssessmentQuestionById = asyncHandler(
  async (req, res) => {
    const assessmentQuestion =
      await assessmentQuestionService
        .getAssessmentQuestionById(
          req.validatedData.params.id
        );

    return successResponse(
      res,
      "Assessment Question fetched successfully.",
      assessmentQuestion,
      200
    );
  }
);

/**
 * Get Questions By Assessment
 */
const getQuestionsByAssessment = asyncHandler(
  async (req, res) => {
    const assessmentQuestions =
      await assessmentQuestionService
        .getQuestionsByAssessment(
          req.validatedData.params.assessmentId
        );

    return successResponse(
      res,
      "Assessment Questions fetched successfully.",
      assessmentQuestions,
      200
    );
  }
);

/**
 * Get Questions By Course Outcome
 */
const getQuestionsByCourseOutcome = asyncHandler(
  async (req, res) => {
    const assessmentQuestions =
      await assessmentQuestionService
        .getQuestionsByCourseOutcome(
          req.validatedData.params.courseOutcomeId
        );

    return successResponse(
      res,
      "Course Outcome Assessment Questions fetched successfully.",
      assessmentQuestions,
      200
    );
  }
);

/**
 * Update Assessment Question
 */
const updateAssessmentQuestion = asyncHandler(
  async (req, res) => {
    const assessmentQuestion =
      await assessmentQuestionService
        .updateAssessmentQuestion(
          req.validatedData.params.id,
          req.validatedData.body
        );

    return successResponse(
      res,
      "Assessment Question updated successfully.",
      assessmentQuestion,
      200
    );
  }
);

/**
 * Delete Assessment Question
 */
const deleteAssessmentQuestion = asyncHandler(
  async (req, res) => {
    await assessmentQuestionService
      .deleteAssessmentQuestion(
        req.validatedData.params.id
      );

    return successResponse(
      res,
      "Assessment Question deleted successfully.",
      null,
      200
    );
  }
);

export default {
  createAssessmentQuestion,
  getAssessmentQuestions,
  getAssessmentQuestionById,
  getQuestionsByAssessment,
  getQuestionsByCourseOutcome,
  updateAssessmentQuestion,
  deleteAssessmentQuestion,
};