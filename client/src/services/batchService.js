/**
 * ------------------------------------------------------------------
 * Batch Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import api from "../api/axios";


/**
 * ------------------------------------------------------------------
 * Get All Batches
 * ------------------------------------------------------------------
 */
export const getBatches = async () => {

  const response =
    await api.get("/batches");

  return response.data?.data ?? [];
};


/**
 * ------------------------------------------------------------------
 * Get Batch By ID
 * ------------------------------------------------------------------
 */
export const getBatchById = async (
  id
) => {

  const response =
    await api.get(
      `/batches/${id}`
    );

  return response.data?.data ?? null;
};


/**
 * ------------------------------------------------------------------
 * Create Batch
 * ------------------------------------------------------------------
 */
export const createBatch = async (
  data
) => {

  const response =
    await api.post(
      "/batches",
      data
    );

  return response.data?.data ?? null;
};


/**
 * ------------------------------------------------------------------
 * Update Batch
 * ------------------------------------------------------------------
 */
export const updateBatch = async (
  id,
  data
) => {

  const response =
    await api.put(
      `/batches/${id}`,
      data
    );

  return response.data?.data ?? null;
};


/**
 * ------------------------------------------------------------------
 * Delete Batch
 * ------------------------------------------------------------------
 */
export const deleteBatch = async (
  id
) => {

  const response =
    await api.delete(
      `/batches/${id}`
    );

  return response.data;
};