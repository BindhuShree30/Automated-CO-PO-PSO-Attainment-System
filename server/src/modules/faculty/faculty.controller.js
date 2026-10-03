/**
 * ------------------------------------------------------------------
 * Faculty Controller
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Handles HTTP requests related to academic faculty.
 *
 * Important:
 * Faculty IDs returned from this controller are IDs from the
 * `faculties` table.
 *
 * These IDs are used by:
 *
 *     course_offerings.faculty_id
 *
 * which references:
 *
 *     faculties.id
 * ------------------------------------------------------------------
 */

import facultyService from "./faculty.service.js";

import asyncHandler from "../../shared/helpers/asyncHandler.js";

import {
  successResponse,
} from "../../shared/helpers/apiResponse.js";


/**
 * ------------------------------------------------------------------
 * Get All Faculty
 * ------------------------------------------------------------------
 *
 * GET /api/v1/faculty
 *
 * Returns all academic faculty records.
 * ------------------------------------------------------------------
 */
const getAllFaculty = asyncHandler(
  async (req, res) => {
    const faculty =
      await facultyService.getAllFaculty();

    return successResponse(
      res,
      "Faculty fetched successfully.",
      faculty
    );
  }
);


/**
 * ------------------------------------------------------------------
 * Get Approved Faculty
 * ------------------------------------------------------------------
 *
 * GET /api/v1/faculty/approved
 *
 * Used by:
 *
 * - Course Offering
 * - Faculty Assignment
 *
 * IMPORTANT:
 *
 * This endpoint must return records from the
 * `faculties` table.
 *
 * Therefore:
 *
 * faculty.id
 *     =
 * faculties.id
 *
 * NOT:
 *
 * users.id
 *
 * Only approved/active academic faculty are returned.
 * ------------------------------------------------------------------
 */
const getApprovedFaculty = asyncHandler(
  async (req, res) => {
    const faculty =
      await facultyService.getApprovedFaculty();

    return successResponse(
      res,
      "Approved faculty fetched successfully.",
      faculty
    );
  }
);


/**
 * ------------------------------------------------------------------
 * Get Faculty By ID
 * ------------------------------------------------------------------
 *
 * GET /api/v1/faculty/:id
 *
 * IMPORTANT:
 *
 * The ID must be `faculties.id`.
 *
 * This is also the ID used by:
 *
 *     course_offerings.faculty_id
 * ------------------------------------------------------------------
 */
const getFacultyById = asyncHandler(
  async (req, res) => {
    const faculty =
      await facultyService.getFacultyById(
        req.params.id
      );

    return successResponse(
      res,
      "Faculty fetched successfully.",
      faculty
    );
  }
);


/**
 * ------------------------------------------------------------------
 * Export Controller
 * ------------------------------------------------------------------
 */
export default {
  getAllFaculty,
  getApprovedFaculty,
  getFacultyById,
};