/**
 * ------------------------------------------------------------------
 * Batch Hooks
 * ------------------------------------------------------------------
 */

import { useQuery } from "@tanstack/react-query";

import {
  getBatches,
  getBatchById,
} from "../services/batchService";

export const useBatches = () =>
  useQuery({
    queryKey: ["batches"],
    queryFn: getBatches,
  });

export const useBatch = (id) =>
  useQuery({
    queryKey: ["batch", id],
    queryFn: () => getBatchById(id),
    enabled: Boolean(id),
  });