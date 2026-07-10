/**
 * ------------------------------------------------------------------
 * Course Controller
 * ------------------------------------------------------------------
 */

import courseService from "./course.service.js";
import asyncHandler from "../../shared/helpers/asyncHandler.js";
import { successResponse } from "../../shared/helpers/apiResponse.js";

/**
 * Create Course
 */
const createCourse = asyncHandler(async (req, res) => {
  const course = await courseService.createCourse(req.validatedData);

  return successResponse(
    res,
    "Course created successfully.",
    course,
    201
  );
});

/**
 * Get All Courses
 */
const getCourses = asyncHandler(async (req, res) => {
  const courses = await courseService.getCourses();

  return successResponse(
    res,
    "Courses fetched successfully.",
    courses,
    200
  );
});

/**
 * Get Course By ID
 */
const getCourseById = asyncHandler(async (req, res) => {
  const course = await courseService.getCourseById(req.params.id);

  return successResponse(
    res,
    "Course fetched successfully.",
    course,
    200
  );
});

/**
 * Update Course
 */
const updateCourse = asyncHandler(async (req, res) => {
  const course = await courseService.updateCourse(
    req.params.id,
    req.validatedData
  );

  return successResponse(
    res,
    "Course updated successfully.",
    course,
    200
  );
});

/**
 * Delete Course
 */
const deleteCourse = asyncHandler(async (req, res) => {
  await courseService.deleteCourse(req.params.id);

  return successResponse(
    res,
    "Course deleted successfully.",
    null,
    200
  );
});

export default {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};