/**
 * ------------------------------------------------------------------
 * Faculty Routes
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { Router } from "express";

import facultyController from "./faculty.controller.js";

import authMiddleware from "../../middleware/auth.middleware.js";

const router = Router();


/**
 * ------------------------------------------------------------------
 * Get Approved Faculty
 * ------------------------------------------------------------------
 *
 * IMPORTANT:
 *
 * This route MUST come before:
 *
 * /:id
 *
 * Otherwise Express may interpret "approved" as an ID.
 *
 * GET /api/v1/faculty/approved
 * ------------------------------------------------------------------
 */
router.get(
  "/approved",
  authMiddleware,
  facultyController.getApprovedFaculty
);


/**
 * ------------------------------------------------------------------
 * Get All Faculty
 * ------------------------------------------------------------------
 *
 * GET /api/v1/faculty
 * ------------------------------------------------------------------
 */
router.get(
  "/",
  authMiddleware,
  facultyController.getAllFaculty
);


/**
 * ------------------------------------------------------------------
 * Get Faculty By ID
 * ------------------------------------------------------------------
 *
 * GET /api/v1/faculty/:id
 * ------------------------------------------------------------------
 */
router.get(
  "/:id",
  authMiddleware,
  facultyController.getFacultyById
);


export default router;