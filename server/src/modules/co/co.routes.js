/**
 * ------------------------------------------------------------------
 * Course Outcome Routes
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { Router } from "express";

import coController from "./co.controller.js";

import authMiddleware from "../../middleware/auth.middleware.js";
import roleMiddleware from "../../middleware/role.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import ROLES from "../../shared/constants/roles.js";

import {
  createCOSchema,
  updateCOSchema,
  coIdSchema,
  courseIdSchema,
} from "./co.schema.js";

const router = Router();

/**
 * Create Course Outcome
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(createCOSchema),
  coController.createCO
);

/**
 * Get All Course Outcomes
 */
router.get(
  "/",
  authMiddleware,
  coController.getCOs
);

/**
 * Get Course Outcomes By Course
 */
router.get(
  "/course/:courseId",
  authMiddleware,
  validate(courseIdSchema),
  coController.getCOsByCourse
);

/**
 * Get Course Outcome By ID
 */
router.get(
  "/:id",
  authMiddleware,
  validate(coIdSchema),
  coController.getCOById
);

/**
 * Update Course Outcome
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(updateCOSchema),
  coController.updateCO
);

/**
 * Delete Course Outcome
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(coIdSchema),
  coController.deleteCO
);

export default router;