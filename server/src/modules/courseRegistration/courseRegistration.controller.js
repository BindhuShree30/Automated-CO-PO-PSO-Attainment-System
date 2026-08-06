/**
 * ------------------------------------------------------------------
 * Course Registration Controller
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import courseRegistrationService from "./courseRegistration.service.js";
import asyncHandler from "../../shared/helpers/asyncHandler.js";
import { successResponse } from "../../shared/helpers/apiResponse.js";

/**
 * Create Course Registration
 */
const createCourseRegistration = asyncHandler(
  async (req, res) => {
    const courseRegistration =
      await courseRegistrationService.createCourseRegistration(
        req.validatedData.body
      );

    return successResponse(
      res,
      "Course Registration created successfully.",
      courseRegistration,
      201
    );
  }
);

/**
 * Get All Course Registrations
 */
const getCourseRegistrations = asyncHandler(
  async (req, res) => {
    const courseRegistrations =
      await courseRegistrationService.getCourseRegistrations();

    return successResponse(
      res,
      "Course Registrations fetched successfully.",
      courseRegistrations,
      200
    );
  }
);

/**
 * Get Course Registration By ID
 */
const getCourseRegistrationById = asyncHandler(
  async (req, res) => {
    const courseRegistration =
      await courseRegistrationService.getCourseRegistrationById(
        req.validatedData.params.id
      );

    return successResponse(
      res,
      "Course Registration fetched successfully.",
      courseRegistration,
      200
    );
  }
);

/**
 * Update Course Registration
 */
const updateCourseRegistration = asyncHandler(
  async (req, res) => {
    const courseRegistration =
      await courseRegistrationService.updateCourseRegistration(
        req.validatedData.params.id,
        req.validatedData.body
      );

    return successResponse(
      res,
      "Course Registration updated successfully.",
      courseRegistration,
      200
    );
  }
);

/**
 * Delete Course Registration
 */
const deleteCourseRegistration = asyncHandler(
  async (req, res) => {
    await courseRegistrationService.deleteCourseRegistration(
      req.validatedData.params.id
    );

    return successResponse(
      res,
      "Course Registration deleted successfully.",
      null,
      200
    );
  }
);

export default {
  createCourseRegistration,
  getCourseRegistrations,
  getCourseRegistrationById,
  updateCourseRegistration,
  deleteCourseRegistration,
};