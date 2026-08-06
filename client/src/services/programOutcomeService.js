import api from "../api/axios";

/**
 * ---------------------------------------------------------
 * Get All Program Outcomes
 * ---------------------------------------------------------
 */
export const getProgramOutcomes = () =>
  api.get("/program-outcomes");

/**
 * ---------------------------------------------------------
 * Get Program Outcome By ID
 * ---------------------------------------------------------
 */
export const getProgramOutcome = (id) =>
  api.get(`/program-outcomes/${id}`);

/**
 * ---------------------------------------------------------
 * Create Program Outcome
 * ---------------------------------------------------------
 */
export const createProgramOutcome = (data) =>
  api.post("/program-outcomes", data);

/**
 * ---------------------------------------------------------
 * Update Program Outcome
 * ---------------------------------------------------------
 */
export const updateProgramOutcome = (id, data) =>
  api.put(`/program-outcomes/${id}`, data);

/**
 * ---------------------------------------------------------
 * Delete Program Outcome
 * ---------------------------------------------------------
 */
export const deleteProgramOutcome = (id) =>
  api.delete(`/program-outcomes/${id}`);