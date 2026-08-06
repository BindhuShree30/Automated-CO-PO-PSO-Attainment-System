import api from "../api/axios";

/**
 * Get All Courses
 */
export const getCourses = () =>
  api.get("/courses");

/**
 * Get Course By ID
 */
export const getCourse = (id) =>
  api.get(`/courses/${id}`);

/**
 * Create Course
 */
export const createCourse = (data) =>
  api.post("/courses", data);

/**
 * Update Course
 */
export const updateCourse = (id, data) =>
  api.put(`/courses/${id}`, data);

/**
 * Delete Course
 */
export const deleteCourse = (id) =>
  api.delete(`/courses/${id}`);