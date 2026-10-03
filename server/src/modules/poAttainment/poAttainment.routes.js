import { Router } from "express";

import poAttainmentController from "./poAttainment.controller.js";

import validate from "../../middleware/validate.middleware.js";

import {
  createPOAttainmentSchema,
  calculatePOAttainmentSchema,
  updatePOAttainmentSchema,
  poAttainmentIdSchema,
} from "./poAttainment.schema.js";

const router = Router();

/**
 * ---------------------------------------------------------
 * Create PO Attainment
 * ---------------------------------------------------------
 */
router.post(
  "/",
  validate(createPOAttainmentSchema),
  poAttainmentController.createPOAttainment
);

/**
 * ---------------------------------------------------------
 * Calculate PO Attainment
 * ---------------------------------------------------------
 */
router.post(
  "/calculate",
  validate(calculatePOAttainmentSchema),
  poAttainmentController.calculatePOAttainment
);

/**
 * ---------------------------------------------------------
 * Get All PO Attainments
 * ---------------------------------------------------------
 */
router.get(
  "/",
  poAttainmentController.getPOAttainments
);

/**
 * ---------------------------------------------------------
 * Get PO Attainment By ID
 * ---------------------------------------------------------
 */
router.get(
  "/:id",
  validate(poAttainmentIdSchema),
  poAttainmentController.getPOAttainmentById
);

/**
 * ---------------------------------------------------------
 * Update PO Attainment
 * ---------------------------------------------------------
 */
router.put(
  "/:id",
  validate(poAttainmentIdSchema),
  validate(updatePOAttainmentSchema),
  poAttainmentController.updatePOAttainment
);

/**
 * ---------------------------------------------------------
 * Delete PO Attainment
 * ---------------------------------------------------------
 */
router.delete(
  "/:id",
  validate(poAttainmentIdSchema),
  poAttainmentController.deletePOAttainment
);

export default router;