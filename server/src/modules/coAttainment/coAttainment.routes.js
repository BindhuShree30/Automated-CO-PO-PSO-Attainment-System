/**
 * ------------------------------------------------------------------
 * CO Attainment Routes
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { Router } from "express";

import coAttainmentController from "./coAttainment.controller.js";

import authMiddleware from "../../middleware/auth.middleware.js";
import roleMiddleware from "../../middleware/role.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import ROLES from "../../shared/constants/roles.js";

import { calculateCOAttainmentSchema } from "./coAttainment.schema.js";

const router = Router();

/**
 * Calculate CO Attainment (Accessible by Faculty and Admin)
 */
router.post(
  "/calculate",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.FACULTY),
  validate(calculateCOAttainmentSchema),
  coAttainmentController.calculateCOAttainment
);

/**
 * Get All CO Attainments
 */
router.get(
  "/",
  authMiddleware,
  coAttainmentController.getCOAttainments
);

/**
 * Get CO Attainments By Course Offering
 */
router.get(
  "/course-offering/:courseOfferingId",
  authMiddleware,
  coAttainmentController.getCOAttainmentsByCourseOfferingId
);

/**
 * Get CO Attainments By Course Outcome
 */
router.get(
  "/course-outcome/:courseOutcomeId",
  authMiddleware,
  coAttainmentController.getCOAttainmentsByCourseOutcomeId
);

/**
 * Get CO Attainment By ID
 */
router.get(
  "/:id",
  authMiddleware,
  coAttainmentController.getCOAttainmentById
);

/**
 * Delete CO Attainment (Admin only)
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  coAttainmentController.deleteCOAttainment
);

export default router;