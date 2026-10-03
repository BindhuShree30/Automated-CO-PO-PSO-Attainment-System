/**
 * ------------------------------------------------------------------
 * Faculty Dashboard Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import api from "../api/axios";

/**
 * ------------------------------------------------------------------
 * Get Faculty Dashboard
 * ------------------------------------------------------------------
 */

export const getFacultyDashboard = async () => {
  const response = await api.get(
    "/dashboard/faculty"
  );

  console.log(
    "Faculty Dashboard API Response:",
    response.data
  );

  return response?.data?.data ?? {};
};


/**
 * ------------------------------------------------------------------
 * Get My Courses
 * ------------------------------------------------------------------
 *
 * GET /api/v1/course-offerings/my-courses
 *
 * Returns only the Course Offerings assigned
 * to the currently logged-in Faculty.
 * ------------------------------------------------------------------
 */

export const getMyCourseOfferings = async () => {
  const response = await api.get(
    "/course-offerings/my-courses"
  );

  console.log(
    "My Course Offerings API Response:",
    response.data
  );

  return response?.data?.data ?? [];
};


/**
 * ------------------------------------------------------------------
 * Export
 * ------------------------------------------------------------------
 */

export default {
  getFacultyDashboard,
  getMyCourseOfferings,
};