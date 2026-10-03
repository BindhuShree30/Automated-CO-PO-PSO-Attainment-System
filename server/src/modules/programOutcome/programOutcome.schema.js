/**
 * ------------------------------------------------------------------
 * Program Outcome Validation Schema
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { z } from "zod";

/**
 * Create Program Outcome
 */
export const createProgramOutcomeSchema = z.object({
  body: z.object({
    programId: z
      .string()
      .uuid("Invalid Program ID"),

    code: z
      .string()
      .trim()
      .min(2, "Program Outcome code is required.")
      .max(20),

    description: z
      .string()
      .trim()
      .min(5, "Description is required.")
      .max(1000),

    status: z
      .boolean()
      .optional()
      .default(true),
  }),
});

/**
 * Update Program Outcome
 */
export const updateProgramOutcomeSchema = z.object({
  params: z.object({
    id: z
      .string()
      .uuid("Invalid Program Outcome ID"),
  }),

  body: z.object({
    code: z
      .string()
      .trim()
      .min(2)
      .max(20)
      .optional(),

    description: z
      .string()
      .trim()
      .min(5)
      .max(1000)
      .optional(),

    status: z
      .boolean()
      .optional(),
  }),
});

/**
 * Program Outcome ID Param
 */
export const programOutcomeIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .uuid("Invalid Program Outcome ID"),
  }),
});

/**
 * Program ID Param
 */
export const programIdSchema = z.object({
  params: z.object({
    programId: z
      .string()
      .uuid("Invalid Program ID"),
  }),
});