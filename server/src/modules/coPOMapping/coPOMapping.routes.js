/**
 * ------------------------------------------------------------------
 * CO–PO Mapping Routes
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { Router } from "express";

import controller from "./coPOMapping.controller.js";

import validate from "../../middleware/validate.middleware.js";

import {
  createCOPOMappingSchema,
  updateCOPOMappingSchema,
  mappingIdSchema,
  courseOutcomeIdSchema,
  programOutcomeIdSchema,
  matrixCourseSchema,
  saveMatrixSchema,
  automateCOPOMappingSchema,
} from "./coPOMapping.schema.js";


const router = Router();


/**
 * ------------------------------------------------------------------
 * Create Mapping
 * ------------------------------------------------------------------
 *
 * POST /api/v1/co-po-mappings
 * ------------------------------------------------------------------
 */
router.post(
  "/",
  validate(
    createCOPOMappingSchema
  ),
  controller.createMapping
);


/**
 * ------------------------------------------------------------------
 * Get All Mappings
 * ------------------------------------------------------------------
 *
 * GET /api/v1/co-po-mappings
 * ------------------------------------------------------------------
 */
router.get(
  "/",
  controller.getMappings
);


/**
 * ------------------------------------------------------------------
 * AUTOMATED CO–PO MAPPING
 * ------------------------------------------------------------------
 *
 * POST /api/v1/co-po-mappings/automate
 *
 * IMPORTANT:
 *
 * This MUST come before:
 *
 * /:id
 *
 * because "automate" must not be
 * interpreted as an ID.
 * ------------------------------------------------------------------
 */
router.post(
  "/automate",
  validate(
    automateCOPOMappingSchema
  ),
  controller.automateMapping
);


/**
 * ------------------------------------------------------------------
 * Get CO–PO Matrix
 * ------------------------------------------------------------------
 *
 * GET /api/v1/co-po-mappings/matrix/:courseId
 * ------------------------------------------------------------------
 */
router.get(
  "/matrix/:courseId",
  validate(
    matrixCourseSchema
  ),
  controller.getMatrix
);


/**
 * ------------------------------------------------------------------
 * Save CO–PO Matrix
 * ------------------------------------------------------------------
 *
 * POST /api/v1/co-po-mappings/matrix
 * ------------------------------------------------------------------
 */
router.post(
  "/matrix",
  validate(
    saveMatrixSchema
  ),
  controller.saveMatrix
);


/**
 * ------------------------------------------------------------------
 * Get Mappings By Course Outcome
 * ------------------------------------------------------------------
 *
 * GET /api/v1/co-po-mappings/course-outcome/:courseOutcomeId
 * ------------------------------------------------------------------
 */
router.get(
  "/course-outcome/:courseOutcomeId",
  validate(
    courseOutcomeIdSchema
  ),
  controller.getMappingsByCourseOutcome
);


/**
 * ------------------------------------------------------------------
 * Get Mappings By Program Outcome
 * ------------------------------------------------------------------
 *
 * GET /api/v1/co-po-mappings/program-outcome/:programOutcomeId
 * ------------------------------------------------------------------
 */
router.get(
  "/program-outcome/:programOutcomeId",
  validate(
    programOutcomeIdSchema
  ),
  controller.getMappingsByProgramOutcome
);


/**
 * ------------------------------------------------------------------
 * Get Mapping By ID
 * ------------------------------------------------------------------
 *
 * GET /api/v1/co-po-mappings/:id
 * ------------------------------------------------------------------
 */
router.get(
  "/:id",
  validate(
    mappingIdSchema
  ),
  controller.getMappingById
);


/**
 * ------------------------------------------------------------------
 * Update CO–PO Mapping
 * ------------------------------------------------------------------
 *
 * PUT /api/v1/co-po-mappings/:id
 * ------------------------------------------------------------------
 */
router.put(
  "/:id",
  validate(
    mappingIdSchema
  ),
  validate(
    updateCOPOMappingSchema
  ),
  controller.updateMapping
);


/**
 * ------------------------------------------------------------------
 * Delete CO–PO Mapping
 * ------------------------------------------------------------------
 *
 * DELETE /api/v1/co-po-mappings/:id
 * ------------------------------------------------------------------
 */
router.delete(
  "/:id",
  validate(
    mappingIdSchema
  ),
  controller.deleteMapping
);


export default router;