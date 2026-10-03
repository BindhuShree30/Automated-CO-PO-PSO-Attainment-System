/**
 * ------------------------------------------------------------------
 * Curriculum Import Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Handles:
 *
 * 1. Upload curriculum Excel
 * 2. Get curriculum imports
 * 3. Get import details
 * 4. Get import rows
 * 5. Edit import row
 *
 * ------------------------------------------------------------------
 */

import api from "../api/axios";

/**
 * ==================================================================
 * UPLOAD CURRICULUM
 * ==================================================================
 */

export const uploadCurriculum = async (
  curriculumId,
  file
) => {
  const formData = new FormData();

  formData.append(
    "file",
    file
  );

  const response =
    await api.post(
      `/curriculum/curriculums/${curriculumId}/import`,
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

  return response.data?.data;
};

/**
 * ==================================================================
 * GET ALL IMPORTS FOR CURRICULUM
 * ==================================================================
 */

export const getCurriculumImports =
  async (curriculumId) => {
    const response =
      await api.get(
        `/curriculum/curriculums/${curriculumId}/imports`
      );

    return response.data?.data ?? [];
  };

/**
 * ==================================================================
 * GET IMPORT BY ID
 * ==================================================================
 */

export const getCurriculumImportById =
  async (importId) => {
    const response =
      await api.get(
        `/curriculum/curriculum-imports/${importId}`
      );

    return response.data?.data ?? null;
  };

/**
 * ==================================================================
 * GET IMPORT ROWS
 * ==================================================================
 */

export const getCurriculumImportRows =
  async (importId) => {
    const response =
      await api.get(
        `/curriculum/curriculum-imports/${importId}/rows`
      );

    return response.data?.data ?? [];
  };

/**
 * ==================================================================
 * EDIT IMPORT ROW
 * ==================================================================
 */

export const updateCurriculumImportRow =
  async (
    importId,
    rowId,
    data
  ) => {
    const response =
      await api.patch(
        `/curriculum/curriculum-imports/${importId}/rows/${rowId}`,
        data
      );

    return response.data?.data;
  };