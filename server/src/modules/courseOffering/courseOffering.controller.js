/**
 * ------------------------------------------------------------------
 * Course Offering Controller
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Handles HTTP requests related to Course Offerings.
 * ------------------------------------------------------------------
 */

import courseOfferingService from "./courseOffering.service.js";

import asyncHandler from "../../shared/helpers/asyncHandler.js";

import {
  successResponse,
} from "../../shared/helpers/apiResponse.js";

/**
 * ------------------------------------------------------------------
 * Create Course Offering
 * ------------------------------------------------------------------
 *
 * POST /api/v1/course-offerings
 * ------------------------------------------------------------------
 */
const createCourseOffering = asyncHandler(
  async (req, res) => {
    const courseOffering =
      await courseOfferingService.createCourseOffering(
        req.body
      );

    return successResponse(
      res,
      "Course Offering created successfully.",
      courseOffering,
      201
    );
  }
);

/**
 * ------------------------------------------------------------------
 * Get All Course Offerings
 * ------------------------------------------------------------------
 *
 * GET /api/v1/course-offerings
 *
 * Used for HOD/Admin course offering management.
 * ------------------------------------------------------------------
 */
const getAllCourseOfferings = asyncHandler(
  async (req, res) => {
    const courseOfferings =
      await courseOfferingService.getAllCourseOfferings();

    return successResponse(
      res,
      "Course Offerings fetched successfully.",
      courseOfferings
    );
  }
);

/**
 * ------------------------------------------------------------------
 * Get My Course Offerings
 * ------------------------------------------------------------------
 *
 * GET /api/v1/course-offerings/my-courses
 *
 * Used by Faculty.
 *
 * Returns ONLY the Course Offerings assigned to
 * the currently authenticated Faculty.
 *
 * Authentication information comes from:
 *
 * req.user
 *
 * The service resolves:
 *
 * req.user.email
 *       ↓
 * Faculty record
 *       ↓
 * Faculty.id
 *       ↓
 * FacultyAssignment.facultyId
 *       ↓
 * CourseOffering
 * ------------------------------------------------------------------
 */
const getMyCourseOfferings = asyncHandler(
  async (req, res) => {
    const courseOfferings =
      await courseOfferingService.getMyCourseOfferings(
        req.user
      );

    return successResponse(
      res,
      "My Course Offerings fetched successfully.",
      courseOfferings
    );
  }
);

/**
 * ------------------------------------------------------------------
 * Get Course Offering By ID
 * ------------------------------------------------------------------
 *
 * GET /api/v1/course-offerings/:id
 * ------------------------------------------------------------------
 */
const getCourseOfferingById = asyncHandler(
  async (req, res) => {
    const courseOffering =
      await courseOfferingService.getCourseOfferingById(
        req.params.id
      );

    return successResponse(
      res,
      "Course Offering fetched successfully.",
      courseOffering
    );
  }
);

/**
 * ------------------------------------------------------------------
 * Update Course Offering
 * ------------------------------------------------------------------
 *
 * PUT /api/v1/course-offerings/:id
 * ------------------------------------------------------------------
 */
const updateCourseOffering = asyncHandler(
  async (req, res) => {
    const courseOffering =
      await courseOfferingService.updateCourseOffering(
        req.params.id,
        req.body
      );

    return successResponse(
      res,
      "Course Offering updated successfully.",
      courseOffering
    );
  }
);

/**
 * ------------------------------------------------------------------
 * Delete Course Offering
 * ------------------------------------------------------------------
 *
 * DELETE /api/v1/course-offerings/:id
 * ------------------------------------------------------------------
 */
const deleteCourseOffering = asyncHandler(
  async (req, res) => {
    await courseOfferingService.deleteCourseOffering(
      req.params.id
    );

    return successResponse(
      res,
      "Course Offering deleted successfully.",
      null
    );
  }
);

/**
 * ------------------------------------------------------------------
 * Export
 * ------------------------------------------------------------------
 */
export default {
  createCourseOffering,
  getAllCourseOfferings,
  getMyCourseOfferings,
  getCourseOfferingById,
  updateCourseOffering,
  deleteCourseOffering,
};