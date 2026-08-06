import api from "../api/axios";

/**
 * Get All Programs
 */
export const getPrograms = () =>
  api.get("/programs");

/**
 * Get Program By Id
 */
export const getProgram = (id) =>
  api.get(`/programs/${id}`);

/**
 * Create Program
 */
export const createProgram = (data) =>
  api.post("/programs", data);

/**
 * Update Program
 */
export const updateProgram = (id, data) =>
  api.put(`/programs/${id}`, data);

/**
 * Delete Program
 */
export const deleteProgram = (id) =>
  api.delete(`/programs/${id}`);