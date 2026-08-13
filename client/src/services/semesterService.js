import api from "../api/axios";

/**
 * ---------------------------------------------------------
 * Semester Service
 * Project: Automated CO–PO–PSO Attainment Analysis System
 * ---------------------------------------------------------
 *
 * Handles all semester-related API requests.
 * ---------------------------------------------------------
 */

/**
 * Get All Semesters
 */
export const getSemesters = () =>
  api.get("/semesters");

/**
 * Get Semester By ID
 */
export const getSemester = (id) =>
  api.get(`/semesters/${id}`);

/**
 * Create Semester
 */
export const createSemester = (data) =>
  api.post("/semesters", data);

/**
 * Update Semester
 */
export const updateSemester = (id, data) =>
  api.put(`/semesters/${id}`, data);

/**
 * Delete Semester
 */
export const deleteSemester = (id) =>
  api.delete(`/semesters/${id}`);