import api from "../api/axios";

/**
 * Get All Students
 */
export const getStudents = () =>
  api.get("/students");

/**
 * Get Student By Id
 */
export const getStudent = (id) =>
  api.get(`/students/${id}`);

/**
 * Create Student
 */
export const createStudent = (data) =>
  api.post("/students", data);

/**
 * Update Student
 */
export const updateStudent = (id, data) =>
  api.put(`/students/${id}`, data);

/**
 * Delete Student
 */
export const deleteStudent = (id) =>
  api.delete(`/students/${id}`);