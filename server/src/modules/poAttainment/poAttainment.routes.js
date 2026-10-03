import { Router } from "express";

import poAttainmentController from "./poAttainment.controller.js";
import validate from "../../middleware/validate.middleware.js";
import authenticate from "../../middleware/auth.middleware.js";

import {
  createPOAttainmentSchema,
  calculatePOAttainmentSchema,
  updatePOAttainmentSchema,
  poAttainmentIdSchema,
  courseOfferingIdParamSchema,
} from "./poAttainment.schema.js";

const router = Router();

/**
 * ---------------------------------------------------------
 * Get Course Attainment Matrix (Excel Table Structure)
 * GET /api/v1/po-attainments/matrix/:courseOfferingId
 * ---------------------------------------------------------
 */
router.get(
  "/matrix/:courseOfferingId",
  authenticate,
  validate(courseOfferingIdParamSchema),
  poAttainmentController.getCourseAttainmentMatrix
);

/**
 * ---------------------------------------------------------
 * Calculate PO Attainment
 * POST /api/v1/po-attainments/calculate
 * ---------------------------------------------------------
 */
router.post(
  "/calculate",
  authenticate,
  validate(calculatePOAttainmentSchema),
  poAttainmentController.calculatePOAttainment
);

/**
 * ---------------------------------------------------------
 * Create PO Attainment
 * POST /api/v1/po-attainments
 * ---------------------------------------------------------
 */
router.post(
  "/",
  authenticate,
  validate(createPOAttainmentSchema),
  poAttainmentController.createPOAttainment
);

/**
 * ---------------------------------------------------------
 * Get All PO Attainments
 * GET /api/v1/po-attainments
 * ---------------------------------------------------------
 */
router.get(
  "/",
  authenticate,
  poAttainmentController.getPOAttainments
);

/**
 * ---------------------------------------------------------
 * Get PO Attainment By ID
 * GET /api/v1/po-attainments/:id
 * ---------------------------------------------------------
 */
router.get(
  "/:id",
  authenticate,
  validate(poAttainmentIdSchema),
  poAttainmentController.getPOAttainmentById
);

/**
 * ---------------------------------------------------------
 * Update PO Attainment
 * PUT /api/v1/po-attainments/:id
 * ---------------------------------------------------------
 */
router.put(
  "/:id",
  authenticate,
  validate(poAttainmentIdSchema),
  validate(updatePOAttainmentSchema),
  poAttainmentController.updatePOAttainment
);

/**
 * ---------------------------------------------------------
 * Delete PO Attainment
 * DELETE /api/v1/po-attainments/:id
 * ---------------------------------------------------------
 */
router.delete(
  "/:id",
  authenticate,
  validate(poAttainmentIdSchema),
  poAttainmentController.deletePOAttainment
);

export default router;