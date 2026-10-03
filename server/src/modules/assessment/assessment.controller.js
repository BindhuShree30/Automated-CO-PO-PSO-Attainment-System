/**
 * ------------------------------------------------------------------
 * Assessment Controller
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import assessmentService from "./assessment.service.js";
import asyncHandler from "../../shared/helpers/asyncHandler.js";
import { successResponse } from "../../shared/helpers/apiResponse.js";

/**
 * Create Assessment
 */
const createAssessment = asyncHandler(async (req, res) => {
  const assessment =
    await assessmentService.createAssessment(
      req.validatedData.body
    );

  return successResponse(
    res,
    "Assessment created successfully.",
    assessment,
    201
  );
});

/**
 * Get All Assessments
 */
const getAssessments = asyncHandler(async (req, res) => {
  const assessments =
    await assessmentService.getAssessments();

  return successResponse(
    res,
    "Assessments fetched successfully.",
    assessments,
    200
  );
});

/**
 * Get Assessment By ID
 */
const getAssessmentById = asyncHandler(async (req, res) => {
  const assessment =
    await assessmentService.getAssessmentById(
      req.validatedData.params.id
    );

  return successResponse(
    res,
    "Assessment fetched successfully.",
    assessment,
    200
  );
});

/**
 * Get Assessments By Course Offering
 */
const getAssessmentsByCourseOffering = asyncHandler(
  async (req, res) => {
    const assessments =
      await assessmentService
        .getAssessmentsByCourseOffering(
          req.validatedData.params.courseOfferingId
        );

    return successResponse(
      res,
      "Course Offering Assessments fetched successfully.",
      assessments,
      200
    );
  }
);

/**
 * Update Assessment
 */
const updateAssessment = asyncHandler(async (req, res) => {
  const assessment =
    await assessmentService.updateAssessment(
      req.validatedData.params.id,
      req.validatedData.body
    );

  return successResponse(
    res,
    "Assessment updated successfully.",
    assessment,
    200
  );
});

/**
 * Delete Assessment
 */
const deleteAssessment = asyncHandler(async (req, res) => {
  await assessmentService.deleteAssessment(
    req.validatedData.params.id
  );

  return successResponse(
    res,
    "Assessment deleted successfully.",
    null,
    200
  );
});

export default {
  createAssessment,
  getAssessments,
  getAssessmentById,
  getAssessmentsByCourseOffering,
  updateAssessment,
  deleteAssessment,
};