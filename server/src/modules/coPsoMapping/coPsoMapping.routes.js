import express from "express";

import controller from "./coPsoMapping.controller.js";
import validate from "../../middleware/validate.middleware.js";

import {
  createCoPsoMappingSchema,
  updateCoPsoMappingSchema,
  coPsoMappingIdSchema,
  courseOutcomeIdSchema,
  programSpecificOutcomeIdSchema,
} from "./coPsoMapping.schema.js";

const router = express.Router();

// Create
router.post(
  "/",
  validate(createCoPsoMappingSchema),
  controller.create
);

// Get All
router.get("/", controller.getAll);

// Get By Course Outcome
router.get(
  "/course-outcome/:courseOutcomeId",
  validate(courseOutcomeIdSchema),
  controller.getByCourseOutcome
);

// Get By Program Specific Outcome
router.get(
  "/program-specific-outcome/:programSpecificOutcomeId",
  validate(programSpecificOutcomeIdSchema),
  controller.getByProgramSpecificOutcome
);

// Get By Id
router.get(
  "/:id",
  validate(coPsoMappingIdSchema),
  controller.getById
);

// Update
router.put(
  "/:id",
  validate(updateCoPsoMappingSchema),
  controller.update
);

// Delete
router.delete(
  "/:id",
  validate(coPsoMappingIdSchema),
  controller.remove
);

export default router;