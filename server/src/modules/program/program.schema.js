/**
 * ------------------------------------------------------------------
 * Program Validation Schema
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { z } from "zod";

/**
 * Create Program Schema
 */
export const createProgramSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Program name must be at least 2 characters.")
      .max(100, "Program name cannot exceed 100 characters."),

    code: z
      .string()
      .trim()
      .min(2, "Program code must be at least 2 characters.")
      .max(20, "Program code cannot exceed 20 characters."),

    duration: z
      .number({
        required_error: "Program duration is required.",
      })
      .int("Program duration must be an integer.")
      .min(1, "Program duration must be at least 1 year.")
      .max(10, "Program duration cannot exceed 10 years."),

    departmentId: z.uuid("Invalid Department ID."),

    status: z.boolean().optional(),
  }),
});

/**
 * Update Program Schema
 */
export const updateProgramSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid Program ID."),
  }),

  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Program name must be at least 2 characters.")
      .max(100, "Program name cannot exceed 100 characters.")
      .optional(),

    code: z
      .string()
      .trim()
      .min(2, "Program code must be at least 2 characters.")
      .max(20, "Program code cannot exceed 20 characters.")
      .optional(),

    duration: z
      .number()
      .int("Program duration must be an integer.")
      .min(1, "Program duration must be at least 1 year.")
      .max(10, "Program duration cannot exceed 10 years.")
      .optional(),

    departmentId: z
      .uuid("Invalid Department ID.")
      .optional(),

    status: z.boolean().optional(),
  }),
});

/**
 * Program ID Schema
 */
export const programIdSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid Program ID."),
  }),
});