import { z } from "zod";

/**
 * ------------------------------------------------------------------
 * Create Course Outcome Schema
 * ------------------------------------------------------------------
 */
export const createCOSchema = z.object({
  body: z.object({
    courseId: z.string().uuid("Valid Course ID is required."),

    coNumber: z
      .number()
      .int("CO Number must be an integer.")
      .positive("CO Number must be positive."),

    code: z.string().min(1, "CO Code is required."),

    description: z.string().min(1, "Description is required."),

    bloomLevel: z
      .string()
      .min(1, "Bloom Level is required."),

    targetAttainment: z
      .number()
      .min(0)
      .max(100),

    status: z.boolean().optional().default(true),
  }),
});

/**
 * ------------------------------------------------------------------
 * Update Course Outcome Schema
 * ------------------------------------------------------------------
 */
export const updateCOSchema = z.object({
  body: z.object({
    coNumber: z.number().int().positive().optional(),

    code: z.string().optional(),

    description: z.string().optional(),

    bloomLevel: z.string().optional(),

    targetAttainment: z.number().min(0).max(100).optional(),

    status: z.boolean().optional(),
  }),
});

/**
 * ------------------------------------------------------------------
 * CO ID Schema
 * ------------------------------------------------------------------
 */
export const coIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid Course Outcome ID."),
  }),
});

/**
 * ------------------------------------------------------------------
 * Course ID Schema
 * ------------------------------------------------------------------
 */
export const courseIdSchema = z.object({
  params: z.object({
    courseId: z.string().uuid("Invalid Course ID."),
  }),
});