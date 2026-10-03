import axiosInstance from "../api/axios";

/**
 * Fetch the complete CO/PO and CO/PSO Attainment Matrix for a course offering
 * (Includes individual cell values and column averages matching NBA format)
 * @param {string} courseOfferingId
 */
export const getCourseAttainmentMatrix = async (courseOfferingId) => {
  const response = await axiosInstance.get(
    `/po-attainments/matrix/${courseOfferingId}`
  );
  return response.data;
};

/**
 * Trigger calculation for a course offering across all POs or a specific PO
 * @param {string} courseOfferingId
 * @param {string} [programOutcomeId]
 */
export const calculateCoursePoAttainment = async (courseOfferingId, programOutcomeId = null) => {
  const payload = { courseOfferingId };
  if (programOutcomeId) {
    payload.programOutcomeId = programOutcomeId;
  }
  const response = await axiosInstance.post("/po-attainments/calculate", payload);
  return response.data;
};

/**
 * Fetch all stored PO attainment records
 */
export const getAllPoAttainments = async () => {
  const response = await axiosInstance.get("/po-attainments");
  return response.data;
};

/**
 * Fetch a single PO attainment record by ID
 * @param {string} id
 */
export const getPoAttainmentById = async (id) => {
  const response = await axiosInstance.get(`/po-attainments/${id}`);
  return response.data;
};

/**
 * Update an existing PO attainment record
 * @param {string} id
 * @param {object} data
 */
export const updatePoAttainment = async (id, data) => {
  const response = await axiosInstance.put(`/po-attainments/${id}`, data);
  return response.data;
};

/**
 * Delete a PO attainment record
 * @param {string} id
 */
export const deletePoAttainment = async (id) => {
  const response = await axiosInstance.delete(`/po-attainments/${id}`);
  return response.data;
};

export default {
  getCourseAttainmentMatrix,
  calculateCoursePoAttainment,
  getAllPoAttainments,
  getPoAttainmentById,
  updatePoAttainment,
  deletePoAttainment,
};