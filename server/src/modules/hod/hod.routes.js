/**
 * ---------------------------------------------------------
 * HOD Routes
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ---------------------------------------------------------
 *
 * All routes in this module require:
 * 1. Valid JWT authentication
 * 2. HOD role
 * ---------------------------------------------------------
 */

import { Router } from "express";

import hodController from "./hod.controller.js";

import authMiddleware from "../../middleware/auth.middleware.js";
import authorize from "../../middleware/role.middleware.js";

const router = Router();

/**
 * ---------------------------------------------------------
 * HOD Authentication & Authorization
 * ---------------------------------------------------------
 */

router.use(authMiddleware);
router.use(authorize("HOD"));

/**
 * ---------------------------------------------------------
 * Faculty Management
 * ---------------------------------------------------------
 */

/**
 * Get pending faculty
 */
router.get(
  "/faculty/pending",
  hodController.getPendingFaculty
);

/**
 * Get all faculty
 */
router.get(
  "/faculty",
  hodController.getAllFaculty
);

/**
 * Get faculty by ID
 */
router.get(
  "/faculty/:id",
  hodController.getFacultyById
);

/**
 * Approve faculty
 */
router.patch(
  "/faculty/:id/approve",
  hodController.approveFaculty
);

/**
 * Reject faculty
 */
router.patch(
  "/faculty/:id/reject",
  hodController.rejectFaculty
);

/**
 * Change faculty status
 */
router.patch(
  "/faculty/:id/status",
  hodController.changeFacultyStatus
);

export default router;