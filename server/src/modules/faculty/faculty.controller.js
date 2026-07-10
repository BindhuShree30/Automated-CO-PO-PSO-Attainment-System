/**
 * ------------------------------------------------------------------
 * Faculty Controller
 * ------------------------------------------------------------------
 */

import facultyService from "./faculty.service.js";
import asyncHandler from "../../shared/helpers/asyncHandler.js";
import { successResponse } from "../../shared/helpers/apiResponse.js";

/**
 * Create Faculty
 */
const createFaculty = asyncHandler(async (req, res) => {
  const faculty = await facultyService.createFaculty(req.validatedData);

  return successResponse(
    res,
    "Faculty created successfully.",
    faculty,
    201
  );
});

/**
 * Get All Faculties
 */
const getFaculties = asyncHandler(async (req, res) => {
  const faculties = await facultyService.getFaculties();

  return successResponse(
    res,
    "Faculties fetched successfully.",
    faculties,
    200
  );
});

/**
 * Get Faculty By ID
 */
const getFacultyById = asyncHandler(async (req, res) => {
  const faculty = await facultyService.getFacultyById(req.params.id);

  return successResponse(
    res,
    "Faculty fetched successfully.",
    faculty,
    200
  );
});

/**
 * Update Faculty
 */
const updateFaculty = asyncHandler(async (req, res) => {
  const faculty = await facultyService.updateFaculty(
    req.params.id,
    req.validatedData
  );

  return successResponse(
    res,
    "Faculty updated successfully.",
    faculty,
    200
  );
});

/**
 * Delete Faculty
 */
const deleteFaculty = asyncHandler(async (req, res) => {
  await facultyService.deleteFaculty(req.params.id);

  return successResponse(
    res,
    "Faculty deleted successfully.",
    null,
    200
  );
});

export default {
  createFaculty,
  getFaculties,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
};