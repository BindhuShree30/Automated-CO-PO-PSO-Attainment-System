/**
 * ------------------------------------------------------------------
 * Faculty Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import api from "../api/axios";

/**
 * Get all faculties
 */
export const getFaculties = async () => {
  const response = await api.get("/faculties");

  return response.data?.data ?? [];
};

/**
 * Get faculty by ID
 */
export const getFacultyById = async (id) => {
  const response = await api.get(
    `/faculties/${id}`
  );

  return response.data?.data ?? null;
};