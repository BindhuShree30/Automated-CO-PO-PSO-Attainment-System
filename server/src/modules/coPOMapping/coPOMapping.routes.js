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
} from "./coPOMapping.schema.js";

const router = Router();

/**
 * ------------------------------------------------------------------
 * Create Mapping
 * ------------------------------------------------------------------
 */
router.post(
  "/",
  validate(createCOPOMappingSchema),
  controller.createMapping
);

/**
 * ------------------------------------------------------------------
 * Get All Mappings
 * ------------------------------------------------------------------
 */
router.get(
  "/",
  controller.getMappings
);

/**
 * ------------------------------------------------------------------
 * Get NBA Matrix
 * ------------------------------------------------------------------
 */
router.get(
  "/matrix/:courseId",
  validate(matrixCourseSchema),
  controller.getMatrix
);

/**
 * ------------------------------------------------------------------
 * Save NBA Matrix
 * ------------------------------------------------------------------
 */
router.post(
  "/matrix",
  validate(saveMatrixSchema),
  controller.saveMatrix
);

/**
 * ------------------------------------------------------------------
 * Get Mappings By Course Outcome
 * ------------------------------------------------------------------
 */
router.get(
  "/course-outcome/:courseOutcomeId",
  validate(courseOutcomeIdSchema),
  controller.getMappingsByCourseOutcome
);

/**
 * ------------------------------------------------------------------
 * Get Mappings By Program Outcome
 * ------------------------------------------------------------------
 */
router.get(
  "/program-outcome/:programOutcomeId",
  validate(programOutcomeIdSchema),
  controller.getMappingsByProgramOutcome
);

/**
 * ------------------------------------------------------------------
 * Get Mapping By ID
 * ------------------------------------------------------------------
 */
router.get(
  "/:id",
  validate(mappingIdSchema),
  controller.getMappingById
);

/**
 * ------------------------------------------------------------------
 * Update Mapping
 * ------------------------------------------------------------------
 */
router.put(
  "/:id",
  validate(mappingIdSchema),
  validate(updateCOPOMappingSchema),
  controller.updateMapping
);

/**
 * ------------------------------------------------------------------
 * Delete Mapping
 * ------------------------------------------------------------------
 */
router.delete(
  "/:id",
  validate(mappingIdSchema),
  controller.deleteMapping
);

export default router;