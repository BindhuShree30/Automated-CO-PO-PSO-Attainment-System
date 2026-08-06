/**
 * ------------------------------------------------------------------
 * Enrollment Controller
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import enrollmentService from "./enrollment.service.js";
import asyncHandler from "../../shared/helpers/asyncHandler.js";
import { successResponse } from "../../shared/helpers/apiResponse.js";

/**
 * Create Enrollment
 */
const createEnrollment = asyncHandler(async (req, res) => {
  const enrollment = await enrollmentService.createEnrollment(
    req.validatedData.body
  );

  return successResponse(
    res,
    "Enrollment created successfully.",
    enrollment,
    201
  );
});

/**
 * Get All Enrollments
 */
const getEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await enrollmentService.getEnrollments();

  return successResponse(
    res,
    "Enrollments fetched successfully.",
    enrollments,
    200
  );
});

/**
 * Get Enrollment By ID
 */
const getEnrollmentById = asyncHandler(async (req, res) => {
  const enrollment = await enrollmentService.getEnrollmentById(
    req.validatedData.params.id
  );

  return successResponse(
    res,
    "Enrollment fetched successfully.",
    enrollment,
    200
  );
});

/**
 * Update Enrollment
 */
const updateEnrollment = asyncHandler(async (req, res) => {
  const enrollment = await enrollmentService.updateEnrollment(
    req.validatedData.params.id,
    req.validatedData.body
  );

  return successResponse(
    res,
    "Enrollment updated successfully.",
    enrollment,
    200
  );
});

/**
 * Delete Enrollment
 */
const deleteEnrollment = asyncHandler(async (req, res) => {
  await enrollmentService.deleteEnrollment(
    req.validatedData.params.id
  );

  return successResponse(
    res,
    "Enrollment deleted successfully.",
    null,
    200
  );
});

export default {
  createEnrollment,
  getEnrollments,
  getEnrollmentById,
  updateEnrollment,
  deleteEnrollment,
};