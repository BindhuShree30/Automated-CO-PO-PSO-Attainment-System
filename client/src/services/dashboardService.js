/**
 * ------------------------------------------------------------------
 * Dashboard Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Handles HOD dashboard API communication.
 * ------------------------------------------------------------------
 */

import api from "../api/axios";

/**
 * ------------------------------------------------------------------
 * Get HOD Dashboard
 * ------------------------------------------------------------------
 *
 * GET /api/v1/dashboard/hod
 *
 * Returns:
 *
 * {
 *   faculty,
 *   students,
 *   courses,
 *   batches,
 *   programOutcomes,
 *   courseOfferings
 * }
 * ------------------------------------------------------------------
 */

export const getHodDashboard = async () => {
  const response = await api.get(
    "/dashboard/hod"
  );

  return response?.data?.data ?? {};
};

export default {
  getHodDashboard,
};