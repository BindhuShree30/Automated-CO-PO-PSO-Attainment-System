/**
 * ------------------------------------------------------------------
 * Student Question Mark Routes
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { Router } from "express";
import studentQuestionMarkController from "./studentQuestionMark.controller.js";

const router = Router();

// ==================================================================
// DIRECT / OVERALL MARKS ROUTES (Quiz, Assignment, Lab, SEE, Project)
// ==================================================================

/**
 * Get all direct marks for an assessment
 * GET /api/v1/student-question-marks/assessment/:assessmentId/direct
 */
router.get(
  "/assessment/:assessmentId/direct",
  studentQuestionMarkController.getDirectMarksByAssessment
);

/**
 * Bulk save direct marks for an assessment
 * POST /api/v1/student-question-marks/assessment/:assessmentId/direct/bulk
 */
router.post(
  "/assessment/:assessmentId/direct/bulk",
  studentQuestionMarkController.saveBulkDirectMarks
);

// ==================================================================
// QUESTION-WISE MARKS ROUTES (CIE / IA)
// ==================================================================

/**
 * Get all question marks for an assessment across all students (Master Ledger)
 * GET /api/v1/student-question-marks/assessment/:assessmentId
 */
router.get(
  "/assessment/:assessmentId",
  studentQuestionMarkController.getMarksByAssessment
);

/**
 * Get marks for one Student in one Assessment (Question-wise)
 * GET /api/v1/student-question-marks/assessment/:assessmentId/student/:studentId
 */
router.get(
  "/assessment/:assessmentId/student/:studentId",
  studentQuestionMarkController.getMarksByAssessmentAndStudent
);

/**
 * Save marks for one Student in one Assessment (Question-wise)
 * POST /api/v1/student-question-marks/assessment/:assessmentId/student/:studentId/bulk
 */
router.post(
  "/assessment/:assessmentId/student/:studentId/bulk",
  studentQuestionMarkController.saveBulkStudentMarks
);

/**
 * Get all marks by Student ID
 * GET /api/v1/student-question-marks/student/:studentId
 */
router.get(
  "/student/:studentId",
  studentQuestionMarkController.getMarksByStudentId
);

/**
 * Get all marks by Assessment Question ID
 * GET /api/v1/student-question-marks/question/:assessmentQuestionId
 */
router.get(
  "/question/:assessmentQuestionId",
  studentQuestionMarkController.getMarksByAssessmentQuestionId
);

// ==================================================================
// STANDARD CRUD ROUTES
// ==================================================================

/**
 * Get all question marks
 * GET /api/v1/student-question-marks
 */
router.get(
  "/",
  studentQuestionMarkController.getStudentQuestionMarks
);

/**
 * Create a single question mark entry
 * POST /api/v1/student-question-marks
 */
router.post(
  "/",
  studentQuestionMarkController.createStudentQuestionMark
);

/**
 * Get a single question mark entry by ID
 * GET /api/v1/student-question-marks/:id
 */
router.get(
  "/:id",
  studentQuestionMarkController.getStudentQuestionMarkById
);

/**
 * Update a single question mark entry by ID
 * PUT /api/v1/student-question-marks/:id
 */
router.put(
  "/:id",
  studentQuestionMarkController.updateStudentQuestionMark
);

/**
 * Delete a question mark entry by ID
 * DELETE /api/v1/student-question-marks/:id
 */
router.delete(
  "/:id",
  studentQuestionMarkController.deleteStudentQuestionMark
);

export default router;