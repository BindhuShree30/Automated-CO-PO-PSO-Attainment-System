/**
 * ------------------------------------------------------------------
 * Dashboard Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Handles dashboard business logic.
 * ------------------------------------------------------------------
 */

import DashboardRepository from "./dashboard.repository.js";

class DashboardService {

  /**
   * ----------------------------------------------------------------
   * Get HOD Dashboard
   * ----------------------------------------------------------------
   */
  async getHodDashboard() {

    const dashboardData =
      await DashboardRepository.getDashboardCounts();

    return dashboardData;
  }


  /**
   * ----------------------------------------------------------------
   * Get Faculty Dashboard
   * ----------------------------------------------------------------
   *
   * @param {string} facultyEmail
   * @returns {Object} Faculty dashboard data
   * ----------------------------------------------------------------
   */
  async getFacultyDashboard(facultyEmail) {

    const dashboardData =
      await DashboardRepository.getFacultyDashboard(
        facultyEmail
      );

    return dashboardData;
  }
}

export default new DashboardService();