import api from "../api/axios";

/**
 * Get All Departments
 */
export const getDepartments = () =>
  api.get("/departments");

/**
 * Get Department By ID
 */
export const getDepartment = (id) =>
  api.get(`/departments/${id}`);

/**
 * Create Department
 */
export const createDepartment = (data) =>
  api.post("/departments", data);

/**
 * Update Department
 */
export const updateDepartment = (id, data) =>
  api.put(`/departments/${id}`, data);

/**
 * Delete Department
 */
export const deleteDepartment = (id) =>
  api.delete(`/departments/${id}`);