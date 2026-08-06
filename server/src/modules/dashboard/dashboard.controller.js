import asyncHandler from "../../shared/helpers/asyncHandler.js";
import { successResponse } from "../../shared/helpers/ApiResponse.js";
import dashboardService from "./dashboard.service.js";

class DashboardController {
  getAdminDashboard = asyncHandler(async (req, res) => {
    console.log("===== Dashboard API Called =====");
    console.log("req.user:", req.user);

    const data = await dashboardService.getAdminDashboard();

    console.log("Dashboard Data:", data);

    return successResponse(
      res,
      "Admin dashboard data fetched successfully.",
      data
    );
  });

  getFacultyDashboard = asyncHandler(async (req, res) => {
    const facultyId = req.user.id;

    const data = await dashboardService.getFacultyDashboard(facultyId);

    return successResponse(
      res,
      "Faculty dashboard data fetched successfully.",
      data
    );
  });
}

export default new DashboardController();