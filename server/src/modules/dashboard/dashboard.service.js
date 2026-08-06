import repository from "./dashboard.repository.js";

class DashboardService {
  /**
   * Admin Dashboard
   */
  async getAdminDashboard() {
    return await repository.getAdminDashboard();
  }

  /**
   * Faculty Dashboard
   */
  async getFacultyDashboard(facultyId) {
    return await repository.getFacultyDashboard(facultyId);
  }
}

export default new DashboardService();