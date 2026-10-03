/**
 * ------------------------------------------------------------------
 * Dashboard Controller
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import DashboardService from "./dashboard.service.js";

class DashboardController {

  /**
   * ----------------------------------------------------------------
   * Get HOD Dashboard
   * ----------------------------------------------------------------
   */

  async getHodDashboard(
    req,
    res,
    next
  ) {

    try {

      const dashboardData =
        await DashboardService.getHodDashboard();

      return res.status(200).json({

        success: true,

        message:
          "HOD dashboard data fetched successfully.",

        data: dashboardData,

        error: null,

      });

    } catch (error) {

      next(error);

    }
  }


  /**
   * ----------------------------------------------------------------
   * Get Faculty Dashboard
   * ----------------------------------------------------------------
   */

  async getFacultyDashboard(
    req,
    res,
    next
  ) {

    try {

      /**
       * ------------------------------------------------------------
       * Authentication middleware places the decoded JWT
       * payload inside req.user.
       *
       * JWT payload:
       * {
       *   id,
       *   email,
       *   role
       * }
       * ------------------------------------------------------------
       */

      const facultyEmail =
        req.user?.email;


      if (!facultyEmail) {

        return res.status(401).json({

          success: false,

          message:
            "Authenticated user email is required.",

          data: null,

          error: null,

        });
      }


      const dashboardData =
        await DashboardService.getFacultyDashboard(
          facultyEmail
        );


      return res.status(200).json({

        success: true,

        message:
          "Faculty dashboard data fetched successfully.",

        data: dashboardData,

        error: null,

      });

    } catch (error) {

      next(error);

    }
  }
}

export default new DashboardController();