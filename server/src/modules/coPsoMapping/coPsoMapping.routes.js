/**
 * ------------------------------------------------------------------
 * CO–PSO Mapping Routes
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import express from "express";

import controller from "./coPsoMapping.controller.js";

import validate from "../../middleware/validate.middleware.js";

import {
  createCoPsoMappingSchema,
  updateCoPsoMappingSchema,
  coPsoMappingIdSchema,
  courseOutcomeIdSchema,
  programSpecificOutcomeIdSchema,
  matrixCourseIdSchema,
  saveMatrixSchema,
} from "./coPsoMapping.schema.js";

const router = express.Router();

// ================================================================
// CREATE
// ================================================================

router.post(
  "/",
  validate(createCoPsoMappingSchema),
  controller.create
);

// ================================================================
// GET ALL
// ================================================================

router.get(
  "/",
  controller.getAll
);

// ================================================================
// GET CO–PSO MATRIX
// ================================================================

router.get(
  "/matrix/:courseId",
  validate(matrixCourseIdSchema),
  controller.getMatrix
);

// ================================================================
// AUTOMATED CO–PSO MAPPING
// ================================================================
//
// IMPORTANT:
// This route MUST appear before "/:id".
//
// Gemini generates AI recommendations.
// Nothing is automatically saved.
//
// Faculty reviews the suggestions and then
// uses the SAVE MATRIX endpoint.
//
// ================================================================

router.get(
  "/automate/:courseId",
  validate(matrixCourseIdSchema),
  controller.automateMapping
);

// ================================================================
// SAVE CO–PSO MATRIX
// ================================================================

router.post(
  "/matrix",
  validate(saveMatrixSchema),
  controller.saveMatrix
);

// ================================================================
// GET BY COURSE OUTCOME
// ================================================================

router.get(
  "/course-outcome/:courseOutcomeId",
  validate(courseOutcomeIdSchema),
  controller.getByCourseOutcome
);

// ================================================================
// GET BY PROGRAM SPECIFIC OUTCOME
// ================================================================

router.get(
  "/program-specific-outcome/:programSpecificOutcomeId",
  validate(programSpecificOutcomeIdSchema),
  controller.getByProgramSpecificOutcome
);

// ================================================================
// GET BY ID
// ================================================================

router.get(
  "/:id",
  validate(coPsoMappingIdSchema),
  controller.getById
);

// ================================================================
// UPDATE
// ================================================================

router.put(
  "/:id",
  validate(updateCoPsoMappingSchema),
  controller.update
);

// ================================================================
// DELETE
// ================================================================

router.delete(
  "/:id",
  validate(coPsoMappingIdSchema),
  controller.remove
);

export default router;