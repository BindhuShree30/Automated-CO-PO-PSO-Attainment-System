/**
 * ------------------------------------------------------------------
 * Curriculum Import Routes
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Handles:
 *
 * 1. Curriculum file upload
 * 2. Curriculum import history
 * 3. Curriculum import details
 * 4. Curriculum import rows
 * 5. Edit curriculum import rows
 * 6. Delete curriculum import
 *
 * Access:
 *
 * HOD:
 *   - Upload curriculum
 *   - Edit curriculum import rows
 *   - Delete curriculum import
 *
 * Authenticated users:
 *   - View import information
 *   - View import rows
 *
 * Upload middleware:
 *   - Existing project upload.middleware.js
 *   - Uses Multer memoryStorage()
 *   - req.file.buffer is available to the service
 * ------------------------------------------------------------------
 */

import { Router } from "express";

import CurriculumImportController from "./curriculumImport.controller.js";

import validate from "../../middleware/validate.middleware.js";
import authenticate from "../../middleware/auth.middleware.js";
import authorize from "../../middleware/role.middleware.js";

import ROLES from "../../shared/constants/roles.js";

import upload from "../../middleware/upload.middleware.js";

import {
  curriculumIdSchema,
  curriculumImportIdSchema,
  curriculumImportRowIdSchema,
} from "./curriculumImport.schema.js";

const router = Router();

/**
 * ------------------------------------------------------------------
 * Upload Curriculum
 * ------------------------------------------------------------------
 *
 * HOD ONLY
 *
 * POST
 * /curriculums/:curriculumId/import
 *
 * Form-data:
 *   file = curriculum Excel file
 *
 * Supported:
 *   .xlsx
 *   .xls
 *
 * Flow:
 *
 * Authentication
 *       ↓
 * HOD Authorization
 *       ↓
 * Parameter Validation
 *       ↓
 * Multer File Upload
 *       ↓
 * Controller
 *       ↓
 * Service
 * ------------------------------------------------------------------
 */

router.post(
  "/curriculums/:curriculumId/import",
  authenticate,
  authorize(ROLES.HOD),
  validate(curriculumIdSchema),
  upload.single("file"),
  CurriculumImportController.uploadCurriculum
);

/**
 * ------------------------------------------------------------------
 * Get All Imports For Curriculum
 * ------------------------------------------------------------------
 *
 * Authenticated users can view.
 *
 * GET
 * /curriculums/:curriculumId/imports
 * ------------------------------------------------------------------
 */

router.get(
  "/curriculums/:curriculumId/imports",
  authenticate,
  validate(curriculumIdSchema),
  CurriculumImportController.getImportsByCurriculumId
);

/**
 * ------------------------------------------------------------------
 * Get Curriculum Import By ID
 * ------------------------------------------------------------------
 *
 * Authenticated users can view.
 *
 * GET
 * /curriculum-imports/:importId
 * ------------------------------------------------------------------
 */

router.get(
  "/curriculum-imports/:importId",
  authenticate,
  validate(curriculumImportIdSchema),
  CurriculumImportController.getImportById
);

/**
 * ------------------------------------------------------------------
 * Get Curriculum Import Rows
 * ------------------------------------------------------------------
 *
 * Authenticated users can view.
 *
 * GET
 * /curriculum-imports/:importId/rows
 *
 * This endpoint is used by the HOD review screen.
 * ------------------------------------------------------------------
 */

router.get(
  "/curriculum-imports/:importId/rows",
  authenticate,
  validate(curriculumImportIdSchema),
  CurriculumImportController.getImportRows
);

/**
 * ------------------------------------------------------------------
 * Edit Curriculum Import Row
 * ------------------------------------------------------------------
 *
 * HOD ONLY
 *
 * PATCH
 * /curriculum-imports/:importId/rows/:rowId
 *
 * Used by the HOD review screen to correct:
 *
 * - course code
 * - course name
 * - semester number
 * - credits
 * - course type
 * - elective group
 * - compulsory status
 * - sequence number
 *
 * The service will re-check the course match after editing.
 * ------------------------------------------------------------------
 */

router.patch(
  "/curriculum-imports/:importId/rows/:rowId",
  authenticate,
  authorize(ROLES.HOD),
  validate(curriculumImportRowIdSchema),
  CurriculumImportController.editImportRow
);

/**
 * ------------------------------------------------------------------
 * Delete Curriculum Import
 * ------------------------------------------------------------------
 *
 * HOD ONLY
 *
 * DELETE
 * /curriculum-imports/:importId
 *
 * Deletes:
 *
 * - Curriculum import record
 * - Imported curriculum rows belonging to the import
 *
 * This is used by the HOD from the Curriculum Import History page.
 * ------------------------------------------------------------------
 */

router.delete(
  "/curriculum-imports/:importId",
  authenticate,
  authorize(ROLES.HOD),
  validate(curriculumImportIdSchema),
  CurriculumImportController.deleteImport
);

export default router;