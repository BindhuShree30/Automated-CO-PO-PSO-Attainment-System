/**
 * ------------------------------------------------------------------
 * Curriculum Import Controller
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
 * ------------------------------------------------------------------
 */

import asyncHandler from "../../shared/helpers/asyncHandler.js";
import { successResponse } from "../../shared/helpers/apiResponse.js";
import ApiError from "../../shared/errors/ApiError.js";

import * as CurriculumImportService from "./curriculumImport.service.js";

/**
 * ------------------------------------------------------------------
 * Upload Curriculum
 * ------------------------------------------------------------------
 */

export const uploadCurriculum = asyncHandler(
  async (req, res) => {
    const { curriculumId } = req.params;

    if (!req.file) {
      throw new ApiError(
        400,
        "Curriculum Excel file is required."
      );
    }

    const result =
      await CurriculumImportService.createImportPreview({
        curriculumId,
        uploadedBy: req.user?.id,
        file: req.file,
      });

    return successResponse(
      res,
      result,
      "Curriculum uploaded successfully."
    );
  }
);

/**
 * ------------------------------------------------------------------
 * Get All Imports For Curriculum
 * ------------------------------------------------------------------
 */

export const getImportsByCurriculumId =
  asyncHandler(async (req, res) => {
    const { curriculumId } = req.params;

    const imports =
      await CurriculumImportService.findImportsByCurriculumId(
        curriculumId
      );

    return successResponse(
      res,
      imports,
      "Curriculum imports fetched successfully."
    );
  });

/**
 * ------------------------------------------------------------------
 * Get Curriculum Import By ID
 * ------------------------------------------------------------------
 */

export const getImportById = asyncHandler(
  async (req, res) => {
    const { importId } = req.params;

    const curriculumImport =
      await CurriculumImportService.findImportById(
        importId
      );

    if (!curriculumImport) {
      throw new ApiError(
        404,
        "Curriculum import not found."
      );
    }

    return successResponse(
      res,
      curriculumImport,
      "Curriculum import fetched successfully."
    );
  }
);

/**
 * ------------------------------------------------------------------
 * Get Curriculum Import Rows
 * ------------------------------------------------------------------
 */

export const getImportRows = asyncHandler(
  async (req, res) => {
    const { importId } = req.params;

    const curriculumImport =
      await CurriculumImportService.findImportById(
        importId
      );

    if (!curriculumImport) {
      throw new ApiError(
        404,
        "Curriculum import not found."
      );
    }

    const rows =
      await CurriculumImportService.findImportRows(
        importId
      );

    return successResponse(
      res,
      rows,
      "Curriculum import rows fetched successfully."
    );
  }
);

/**
 * ------------------------------------------------------------------
 * Edit Curriculum Import Row
 * ------------------------------------------------------------------
 */

export const editImportRow = asyncHandler(
  async (req, res) => {
    const { importId, rowId } = req.params;

    const updatedRow =
      await CurriculumImportService.editImportRow(
        importId,
        rowId,
        req.body
      );

    return successResponse(
      res,
      updatedRow,
      "Curriculum import row updated successfully."
    );
  }
);

/**
 * ------------------------------------------------------------------
 * Delete Curriculum Import
 * ------------------------------------------------------------------
 *
 * HOD ONLY
 *
 * Deletes:
 *
 * - Curriculum import record
 * - All imported rows belonging to that import
 * ------------------------------------------------------------------
 */

export const deleteImport = asyncHandler(
  async (req, res) => {
    const { importId } = req.params;

    const curriculumImport =
      await CurriculumImportService.findImportById(
        importId
      );

    if (!curriculumImport) {
      throw new ApiError(
        404,
        "Curriculum import not found."
      );
    }

    await CurriculumImportService.deleteImport(
      importId
    );

    return successResponse(
      res,
      null,
      "Curriculum import deleted successfully."
    );
  }
);

/**
 * ------------------------------------------------------------------
 * Controller Export
 * ------------------------------------------------------------------
 */

export default {
  uploadCurriculum,
  getImportsByCurriculumId,
  getImportById,
  getImportRows,
  editImportRow,
  deleteImport,
};