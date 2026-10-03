import api from "../api/axios";

/**
 * ------------------------------------------------------------------
 * Course Offering Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

/**
 * ------------------------------------------------------------------
 * Get All Course Offerings
 * ------------------------------------------------------------------
 */
export const getCourseOfferings = () => {
  return api.get("/course-offerings");
};

/**
 * ------------------------------------------------------------------
 * Get My Course Offerings
 * ------------------------------------------------------------------
 */
export const getMyCourseOfferings = () => {
  return api.get("/course-offerings/my-courses");
};

/**
 * ------------------------------------------------------------------
 * Get Course Offering By ID
 * ------------------------------------------------------------------
 */
export const getCourseOfferingById = (id) => {
  return api.get(`/course-offerings/${id}`);
};

/**
 * ------------------------------------------------------------------
 * Alias
 * ------------------------------------------------------------------
 */
export const getCourseOffering = (id) => {
  return getCourseOfferingById(id);
};

/**
 * ------------------------------------------------------------------
 * Create Course Offering
 * ------------------------------------------------------------------
 */
export const createCourseOffering = (data) => {
  return api.post("/course-offerings", data);
};

/**
 * ------------------------------------------------------------------
 * Update Course Offering
 * ------------------------------------------------------------------
 *
 * IMPORTANT:
 * Signature is:
 *
 * updateCourseOffering(id, data)
 *
 * ------------------------------------------------------------------
 */
export const updateCourseOffering = (id, data) => {
  return api.put(
    `/course-offerings/${id}`,
    data
  );
};

/**
 * ------------------------------------------------------------------
 * Delete Course Offering
 * ------------------------------------------------------------------
 */
export const deleteCourseOffering = (id) => {
  return api.delete(
    `/course-offerings/${id}`
  );
};