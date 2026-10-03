/**
 * ------------------------------------------------------------------
 * Batch Validation Schema
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { z } from "zod";

/**
 * Create Batch Schema
 */
export const createBatchSchema = z.object({
  body: z.object({
    programId: z.uuid("Invalid Program ID."),

    startYear: z
      .number({
        required_error: "Start Year is required.",
      })
      .int("Start Year must be an integer.")
      .min(2000, "Start Year must be at least 2000.")
      .max(2100, "Start Year cannot exceed 2100."),

    endYear: z
      .number({
        required_error: "End Year is required.",
      })
      .int("End Year must be an integer.")
      .min(2001, "End Year must be at least 2001.")
      .max(2110, "End Year cannot exceed 2110."),

    status: z.boolean().optional(),
  }),
});

/**
 * Update Batch Schema
 */
export const updateBatchSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid Batch ID."),
  }),

  body: z.object({
    programId: z.uuid("Invalid Program ID.").optional(),

    startYear: z
      .number()
      .int("Start Year must be an integer.")
      .min(2000, "Start Year must be at least 2000.")
      .max(2100, "Start Year cannot exceed 2100.")
      .optional(),

    endYear: z
      .number()
      .int("End Year must be an integer.")
      .min(2001, "End Year must be at least 2001.")
      .max(2110, "End Year cannot exceed 2110.")
      .optional(),

    status: z.boolean().optional(),
  }),
});

/**
 * Batch ID Schema
 */
export const batchIdSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid Batch ID."),
  }),
});