import { Router } from "express";

import AcademicYearController from "./academicYear.controller.js";

import validate from "../../middleware/validate.middleware.js";
import authenticate from "../../middleware/auth.middleware.js";

import {
  createAcademicYearSchema,
  updateAcademicYearSchema,
  academicYearIdSchema,
} from "./academicYear.schema.js";

console.log("✅ Academic Year Routes Loaded");

const router = Router();

/**
 * Create Academic Year
 */
router.post(
  "/",
  authenticate,
  validate(createAcademicYearSchema),
  AcademicYearController.createAcademicYear
);

/**
 * Get All Academic Years
 */
router.get(
  "/",
  authenticate,
  AcademicYearController.getAllAcademicYears
);

/**
 * Get Academic Year By ID
 */
router.get(
  "/:id",
  authenticate,
  validate(academicYearIdSchema),
  AcademicYearController.getAcademicYearById
);

/**
 * Update Academic Year
 */
router.put(
  "/:id",
  authenticate,
  validate(updateAcademicYearSchema),
  AcademicYearController.updateAcademicYear
);

/**
 * Delete Academic Year
 */
router.delete(
  "/:id",
  authenticate,
  validate(academicYearIdSchema),
  AcademicYearController.deleteAcademicYear
);

export default router;