/**
 * ------------------------------------------------------------------
 * Dashboard Routes
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { Router } from "express";

import DashboardController
  from "./dashboard.controller.js";

import authenticate
  from "../../middleware/auth.middleware.js";

import authorize
  from "../../middleware/role.middleware.js";

import ROLES
  from "../../shared/constants/roles.js";

const router = Router();


/**
 * ------------------------------------------------------------------
 * HOD Dashboard
 * ------------------------------------------------------------------
 *
 * GET /api/v1/dashboard/hod
 * ------------------------------------------------------------------
 */

router.get(
  "/hod",
  authenticate,
  authorize(ROLES.HOD),
  DashboardController.getHodDashboard
);


/**
 * ------------------------------------------------------------------
 * Faculty Dashboard
 * ------------------------------------------------------------------
 *
 * GET /api/v1/dashboard/faculty
 * ------------------------------------------------------------------
 */

router.get(
  "/faculty",
  authenticate,
  authorize(ROLES.FACULTY),
  DashboardController.getFacultyDashboard
);


export default router;