/**
 * ------------------------------------------------------------------
 * Course Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Handles Course API communication.
 * ------------------------------------------------------------------
 */

import api from "../api/axios";

/**
 * ------------------------------------------------------------------
 * Get All Courses
 * ------------------------------------------------------------------
 *
 * Used for HOD course management.
 *
 * GET /api/v1/courses
 * ------------------------------------------------------------------
 */

export const getCourses = async () => {
  return await api.get("/courses");
};

/**
 * ------------------------------------------------------------------
 * Get My Assigned Courses
 * ------------------------------------------------------------------
 *
 * Used by FACULTY.
 *
 * Only courses assigned to the logged-in faculty
 * through CourseOffering are returned.
 *
 * GET /api/v1/course-offerings/my-courses
 * ------------------------------------------------------------------
 */

export const getMyCourses = async () => {
  return await api.get(
    "/course-offerings/my-courses"
  );
};

/**
 * ------------------------------------------------------------------
 * Get Course By ID
 * ------------------------------------------------------------------
 *
 * GET /api/v1/courses/:id
 * ------------------------------------------------------------------
 */

export const getCourse = async (
  id
) => {
  return await api.get(
    `/courses/${id}`
  );
};

/**
 * ------------------------------------------------------------------
 * Create Course
 * ------------------------------------------------------------------
 *
 * POST /api/v1/courses
 * ------------------------------------------------------------------
 */

export const createCourse = async (
  data
) => {
  return await api.post(
    "/courses",
    data
  );
};

/**
 * ------------------------------------------------------------------
 * Update Course
 * ------------------------------------------------------------------
 *
 * PUT /api/v1/courses/:id
 * ------------------------------------------------------------------
 */

export const updateCourse = async (
  id,
  data
) => {
  return await api.put(
    `/courses/${id}`,
    data
  );
};

/**
 * ------------------------------------------------------------------
 * Delete Course
 * ------------------------------------------------------------------
 *
 * DELETE /api/v1/courses/:id
 * ------------------------------------------------------------------
 */

export const deleteCourse = async (
  id
) => {
  return await api.delete(
    `/courses/${id}`
  );
};

export default {
  getCourses,
  getMyCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
};