/**
 * ------------------------------------------------------------------
 * Program Specific Outcome Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * Module  : HOD
 * ------------------------------------------------------------------
 */

import api from "../api/axios";

/**
 * ------------------------------------------------------------------
 * Get All Program Specific Outcomes
 * ------------------------------------------------------------------
 */
export const getProgramSpecificOutcomes = () => {
  return api.get("/program-specific-outcomes");
};

/**
 * ------------------------------------------------------------------
 * Get Program Specific Outcome By ID
 * ------------------------------------------------------------------
 */
export const getProgramSpecificOutcome = (id) => {
  return api.get(
    `/program-specific-outcomes/${id}`
  );
};

/**
 * ------------------------------------------------------------------
 * Get PSOs By Program
 * ------------------------------------------------------------------
 */
export const getProgramSpecificOutcomesByProgram = (
  programId
) => {
  return api.get(
    `/program-specific-outcomes/program/${programId}`
  );
};

/**
 * ------------------------------------------------------------------
 * Create Program Specific Outcome
 * ------------------------------------------------------------------
 */
export const createProgramSpecificOutcome = (
  data
) => {
  return api.post(
    "/program-specific-outcomes",
    data
  );
};

/**
 * ------------------------------------------------------------------
 * Update Program Specific Outcome
 * ------------------------------------------------------------------
 */
export const updateProgramSpecificOutcome = (
  id,
  data
) => {
  return api.put(
    `/program-specific-outcomes/${id}`,
    data
  );
};

/**
 * ------------------------------------------------------------------
 * Delete Program Specific Outcome
 * ------------------------------------------------------------------
 */
export const deleteProgramSpecificOutcome = (
  id
) => {
  return api.delete(
    `/program-specific-outcomes/${id}`
  );
};