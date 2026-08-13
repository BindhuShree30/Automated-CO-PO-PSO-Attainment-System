/**
 * ------------------------------------------------------------------
 * Admin Routes
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { Router } from "express";

import adminController from "./admin.controller.js";

import validate from "../../middleware/validate.middleware.js";

import { userIdSchema } from "./admin.schema.js";

import authMiddleware from "../../middleware/auth.middleware.js";
import authorize from "../../middleware/role.middleware.js";

import ROLES from "../../shared/constants/roles.js";

const router = Router();

/**
 * ----------------------------------------------------------
 * Get Pending Users
 * ----------------------------------------------------------
 */
router.get(
  "/pending-users",
  authMiddleware,
  authorize(ROLES.ADMIN),
  adminController.getPendingUsers
);

/**
 * ----------------------------------------------------------
 * Approve User
 * ----------------------------------------------------------
 */
router.patch(
  "/users/:id/approve",
  authMiddleware,
  authorize(ROLES.ADMIN),
  validate(userIdSchema),
  adminController.approveUser
);

/**
 * ----------------------------------------------------------
 * Reject User
 * ----------------------------------------------------------
 */
router.delete(
  "/users/:id",
  authMiddleware,
  authorize(ROLES.ADMIN),
  validate(userIdSchema),
  adminController.rejectUser
);

export default router;