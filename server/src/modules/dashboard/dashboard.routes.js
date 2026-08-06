import { Router } from "express";

import controller from "./dashboard.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import authorize from "../../middleware/role.middleware.js";

const router = Router();

/**
 * Admin Dashboard
 */
router.get(
  "/admin",
  authMiddleware,
  authorize("ADMIN"),
  controller.getAdminDashboard
);

/**
 * Faculty Dashboard
 */
router.get(
  "/faculty",
  authMiddleware,
  authorize("FACULTY"),
  controller.getFacultyDashboard
);

export default router;