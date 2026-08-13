/**
 * ------------------------------------------------------------------
 * Course Offering Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import api from "../api/axios";

/**
 * Get All Course Offerings
 */
export const getCourseOfferings = async () => {
  const response = await api.get(
    "/course-offerings"
  );

  return response.data?.data ?? [];
};

/**
 * Get Course Offering By ID
 */
export const getCourseOfferingById = async (id) => {
  const response = await api.get(
    `/course-offerings/${id}`
  );

  return response.data?.data ?? null;
};

/**
 * Create Course Offering
 */
export const createCourseOffering = async (data) => {
  const response = await api.post(
    "/course-offerings",
    data
  );

  return response.data?.data ?? null;
};

/**
 * Update Course Offering
 */
export const updateCourseOffering = async ({
  id,
  data,
}) => {
  const response = await api.put(
    `/course-offerings/${id}`,
    data
  );

  return response.data?.data ?? null;
};

/**
 * Delete Course Offering
 */
export const deleteCourseOffering = async (id) => {
  const response = await api.delete(
    `/course-offerings/${id}`
  );

  return response.data;
};