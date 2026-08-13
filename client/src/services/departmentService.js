/**
 * ------------------------------------------------------------------
 * Department Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Handles all Department API communication.
 * ------------------------------------------------------------------
 */

import api from "../api/axios";

/**
 * ------------------------------------------------------------------
 * Get All Departments
 * ------------------------------------------------------------------
 *
 * GET /api/v1/departments
 *
 * Returns:
 * [
 *   {
 *     id,
 *     name,
 *     code,
 *     status
 *   }
 * ]
 * ------------------------------------------------------------------
 */
export const getDepartments = async () => {
  const response = await api.get(
    "/departments"
  );

  /**
   * Backend response:
   *
   * {
   *   success: true,
   *   message: "...",
   *   data: [...]
   * }
   *
   * Return only the data array to the component.
   */
  return response?.data?.data ?? [];
};


/**
 * ------------------------------------------------------------------
 * Get Department By ID
 * ------------------------------------------------------------------
 */
export const getDepartment = async (
  id
) => {
  const response = await api.get(
    `/departments/${id}`
  );

  return response?.data?.data ?? null;
};


/**
 * ------------------------------------------------------------------
 * Create Department
 * ------------------------------------------------------------------
 */
export const createDepartment = async (
  data
) => {
  const response = await api.post(
    "/departments",
    data
  );

  return response?.data;
};


/**
 * ------------------------------------------------------------------
 * Update Department
 * ------------------------------------------------------------------
 */
export const updateDepartment = async (
  id,
  data
) => {
  const response = await api.put(
    `/departments/${id}`,
    data
  );

  return response?.data;
};


/**
 * ------------------------------------------------------------------
 * Delete Department
 * ------------------------------------------------------------------
 */
export const deleteDepartment = async (
  id
) => {
  const response = await api.delete(
    `/departments/${id}`
  );

  return response?.data;
};