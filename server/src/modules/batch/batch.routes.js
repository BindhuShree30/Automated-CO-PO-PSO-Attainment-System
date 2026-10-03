/**
 * ------------------------------------------------------------------
 * Batch Routes
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { Router } from "express";

import BatchController from "./batch.controller.js";

import validate from "../../middleware/validate.middleware.js";
import authenticate from "../../middleware/auth.middleware.js";

import {
  createBatchSchema,
  updateBatchSchema,
  batchIdSchema,
} from "./batch.schema.js";

const router = Router();

/**
 * Create Batch
 */
router.post(
  "/",
  authenticate,
  validate(createBatchSchema),
  BatchController.createBatch
);

/**
 * Get All Batches
 */
router.get(
  "/",
  authenticate,
  BatchController.getAllBatches
);

/**
 * Get Batch By ID
 */
router.get(
  "/:id",
  authenticate,
  validate(batchIdSchema),
  BatchController.getBatchById
);

/**
 * Update Batch
 */
router.put(
  "/:id",
  authenticate,
  validate(updateBatchSchema),
  BatchController.updateBatch
);

/**
 * Delete Batch
 */
router.delete(
  "/:id",
  authenticate,
  validate(batchIdSchema),
  BatchController.deleteBatch
);

export default router;