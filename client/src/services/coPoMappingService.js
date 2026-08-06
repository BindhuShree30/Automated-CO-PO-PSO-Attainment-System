import api from "../api/axios";

/**
 * ---------------------------------------------------------
 * Courses
 * ---------------------------------------------------------
 */
export const getCourses = () =>
  api.get("/courses");

/**
 * ---------------------------------------------------------
 * Course Outcomes
 * ---------------------------------------------------------
 */
export const getCourseOutcomes = (courseId) =>
  api.get(`/co/course/${courseId}`);

/**
 * ---------------------------------------------------------
 * Program Outcomes
 * ---------------------------------------------------------
 */
export const getProgramOutcomes = (programId) =>
  api.get(`/program-outcomes/program/${programId}`);

/**
 * ---------------------------------------------------------
 * Get Matrix
 * ---------------------------------------------------------
 */
export const getMatrix = (courseId) =>
  api.get(`/co-po-mappings/matrix/${courseId}`);

/**
 * ---------------------------------------------------------
 * Save Matrix
 * ---------------------------------------------------------
 */
export const saveMatrix = (matrix) =>
  api.post("/co-po-mappings/matrix", {
    matrix,
  });

/**
 * ---------------------------------------------------------
 * Course Details
 * ---------------------------------------------------------
 */
export const getCourse = (courseId) =>
  api.get(`/courses/${courseId}`);