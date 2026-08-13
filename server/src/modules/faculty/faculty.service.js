/**
 * ------------------------------------------------------------------
 * Faculty Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Handles business logic related to academic faculty.
 * ------------------------------------------------------------------
 */

import facultyRepository from "./faculty.repository.js";
import ApiError from "../../shared/errors/ApiError.js";

/**
 * ------------------------------------------------------------------
 * Get All Faculty
 * ------------------------------------------------------------------
 */
const getAllFaculty = async () => {
  return await facultyRepository.findAllFaculty();
};

/**
 * ------------------------------------------------------------------
 * Get Approved Faculty
 * ------------------------------------------------------------------
 *
 * IMPORTANT:
 *
 * This endpoint is used by:
 *
 * - Add Course Offering
 * - Faculty Assignment
 *
 * Only faculty whose:
 *
 *     faculties.status = true
 *
 * AND whose login account is:
 *
 *     users.role = FACULTY
 *     users.status = APPROVED
 *
 * are returned.
 *
 * The ID returned is ALWAYS:
 *
 *     faculties.id
 *
 * NOT:
 *
 *     users.id
 * ------------------------------------------------------------------
 */
const getApprovedFaculty = async () => {
  return await facultyRepository.findApprovedFaculty();
};

/**
 * ------------------------------------------------------------------
 * Get Faculty By ID
 * ------------------------------------------------------------------
 *
 * facultyId refers to:
 *
 *     faculties.id
 * ------------------------------------------------------------------
 */
const getFacultyById = async (facultyId) => {
  const faculty =
    await facultyRepository.findFacultyById(
      facultyId
    );

  if (!faculty) {
    throw new ApiError(
      404,
      "Faculty not found."
    );
  }

  return faculty;
};

/**
 * ------------------------------------------------------------------
 * Export
 * ------------------------------------------------------------------
 */
export default {
  getAllFaculty,
  getApprovedFaculty,
  getFacultyById,
};