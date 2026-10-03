/*
 * ------------------------------------------------------------------
 * Assessment Question Controller
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import assessmentQuestionService from "./assessmentQuestion.service.js";

import asyncHandler from "../../shared/helpers/asyncHandler.js";

import {
  successResponse,
} from "../../shared/helpers/apiResponse.js";

/**
 * ------------------------------------------------------------------
 * Create Question
 * ------------------------------------------------------------------
 */
const createAssessmentQuestion =
  asyncHandler(async (req, res) => {
    const question =
      await assessmentQuestionService
        .createAssessmentQuestion(
          req.validatedData.body
        );

    return successResponse(
      res,
      "Assessment Question created successfully.",
      question,
      201
    );
  });

/**
 * ------------------------------------------------------------------
 * Get All Questions
 * ------------------------------------------------------------------
 */
const getAssessmentQuestions =
  asyncHandler(async (req, res) => {
    const questions =
      await assessmentQuestionService
        .getAssessmentQuestions();

    return successResponse(
      res,
      "Assessment Questions fetched successfully.",
      questions,
      200
    );
  });

/**
 * ------------------------------------------------------------------
 * Get Questions By Assessment
 * ------------------------------------------------------------------
 */
const getQuestionsByAssessment =
  asyncHandler(async (req, res) => {
    const questions =
      await assessmentQuestionService
        .getQuestionsByAssessment(
          req.validatedData.params
            .assessmentId
        );

    return successResponse(
      res,
      "Assessment Questions fetched successfully.",
      questions,
      200
    );
  });

/**
 * ------------------------------------------------------------------
 * Get Question By ID
 * ------------------------------------------------------------------
 */
const getAssessmentQuestionById =
  asyncHandler(async (req, res) => {
    const question =
      await assessmentQuestionService
        .getAssessmentQuestionById(
          req.validatedData.params.id
        );

    return successResponse(
      res,
      "Assessment Question fetched successfully.",
      question,
      200
    );
  });

/**
 * ------------------------------------------------------------------
 * Update Question
 * ------------------------------------------------------------------
 */
const updateAssessmentQuestion =
  asyncHandler(async (req, res) => {
    const question =
      await assessmentQuestionService
        .updateAssessmentQuestion(
          req.validatedData.params.id,
          req.validatedData.body
        );

    return successResponse(
      res,
      "Assessment Question updated successfully.",
      question,
      200
    );
  });

/**
 * ------------------------------------------------------------------
 * Delete Question
 * ------------------------------------------------------------------
 */
const deleteAssessmentQuestion =
  asyncHandler(async (req, res) => {
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
  });

/**
 * ------------------------------------------------------------------
 * Preview Uploaded Question Paper
 * ------------------------------------------------------------------
 *
 * Supported:
 * - PDF
 * - Excel (.xlsx)
 * - Excel (.xls)
 * - CSV
 *
 * IMPORTANT:
 * The route currently uses:
 *
 * upload.any()
 *
 * Therefore uploaded files are available in req.files.
 *
 * This method only parses and validates the file.
 * It does NOT save questions to the database.
 * ------------------------------------------------------------------
 */
const previewAssessmentQuestionsUpload =
  asyncHandler(async (req, res) => {
    console.log(
      "================================================"
    );
    console.log(
      "ASSESSMENT QUESTION UPLOAD"
    );
    console.log(
      "ASSESSMENT ID:",
      req.body?.assessmentId
    );
    console.log(
      "FILES:",
      req.files?.map((file) => ({
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      }))
    );
    console.log(
      "================================================"
    );

    const {
      assessmentId,
    } = req.body;

    /**
     * Validate Assessment ID
     */
    if (!assessmentId) {
      return res.status(400).json({
        success: false,
        message:
          "Assessment ID is required.",
        data: null,
        error:
          "Assessment ID is required.",
      });
    }

    /**
     * Validate uploaded files
     */
    if (
      !req.files ||
      !Array.isArray(req.files) ||
      req.files.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Question paper file is required.",
        data: null,
        error:
          "No file uploaded.",
      });
    }

    /**
     * We expect exactly one question paper.
     */
    if (req.files.length > 1) {
      return res.status(400).json({
        success: false,
        message:
          "Only one question paper can be uploaded at a time.",
        data: null,
        error:
          "Multiple files are not allowed.",
      });
    }

    const file = req.files[0];

    /**
     * Validate file object
     */
    if (!file.buffer) {
      return res.status(400).json({
        success: false,
        message:
          "Uploaded file could not be read.",
        data: null,
        error:
          "File buffer is missing.",
      });
    }

    /**
     * Parse question paper
     */
    const result =
      await assessmentQuestionService
        .previewAssessmentQuestionsUpload(
          assessmentId,
          file.buffer,
          file.originalname
        );

    return successResponse(
      res,
      "Question paper parsed successfully.",
      result,
      200
    );
  });

/**
 * ------------------------------------------------------------------
 * Confirm Uploaded Question Paper
 * ------------------------------------------------------------------
 *
 * This receives the final reviewed/edited questions
 * and saves them to the database.
 * ------------------------------------------------------------------
 */
const confirmAssessmentQuestionsUpload =
  asyncHandler(async (req, res) => {
    const {
      assessmentId,
      questions,
    } = req.body;

    /**
     * Validate Assessment ID
     */
    if (!assessmentId) {
      return res.status(400).json({
        success: false,
        message:
          "Assessment ID is required.",
        data: null,
        error:
          "Assessment ID is required.",
      });
    }

    /**
     * Validate Questions
     */
    if (
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one question is required.",
        data: null,
        error:
          "Questions array is required.",
      });
    }

    /**
     * Save questions
     */
    const result =
      await assessmentQuestionService
        .confirmAssessmentQuestionsUpload(
          assessmentId,
          questions
        );

    return successResponse(
      res,
      "Assessment questions uploaded successfully.",
      result,
      201
    );
  });

/**
 * ------------------------------------------------------------------
 * Export Controller
 * ------------------------------------------------------------------
 */
export default {
  createAssessmentQuestion,
  getAssessmentQuestions,
  getQuestionsByAssessment,
  getAssessmentQuestionById,
  updateAssessmentQuestion,
  deleteAssessmentQuestion,
  previewAssessmentQuestionsUpload,
  confirmAssessmentQuestionsUpload,
};