import api from "../api/axios";

/**
 * ---------------------------------------------------------
 * Student Service
 * Project: Automated CO–PO–PSO Attainment Analysis System
 * ---------------------------------------------------------
 * Handles all student-related API requests.
 *
 * Current scope:
 * - Single department implementation
 * - HOD manages students
 * - USN is the unique student identifier
 * - Department and semester are provided by the backend
 * ---------------------------------------------------------
 */

/**
 * Get all students
 */
export const getStudents = () =>
  api.get("/students");

/**
 * Get student by ID
 */
export const getStudent = (id) =>
  api.get(`/students/${id}`);

/**
 * Create student
 */
export const createStudent = (data) =>
  api.post("/students", data);

/**
 * Update student
 */
export const updateStudent = (id, data) =>
  api.put(`/students/${id}`, data);

/**
 * Delete student
 */
export const deleteStudent = (id) =>
  api.delete(`/students/${id}`);