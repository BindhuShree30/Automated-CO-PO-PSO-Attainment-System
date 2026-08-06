/**
 * ------------------------------------------------------------------
 * Academic Year Validation Schema
 * ------------------------------------------------------------------
 */

import { z } from "zod";

/**
 * Create Academic Year Schema
 */
export const createAcademicYearSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(5, "Academic Year name is required.")
      .max(20, "Academic Year name cannot exceed 20 characters."),

    startYear: z
      .number({
        required_error: "Start Year is required.",
      })
      .int()
      .min(2000)
      .max(2100),

    endYear: z
      .number({
        required_error: "End Year is required.",
      })
      .int()
      .min(2001)
      .max(2101),

    isCurrent: z.boolean().optional(),

    status: z.boolean().optional(),
  }),
});

/**
 * Update Academic Year Schema
 */
export const updateAcademicYearSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid Academic Year ID."),
  }),

  body: z.object({
    name: z
      .string()
      .trim()
      .min(5)
      .max(20)
      .optional(),

    startYear: z.number().int().optional(),

    endYear: z.number().int().optional(),

    isCurrent: z.boolean().optional(),

    status: z.boolean().optional(),
  }),
});

/**
 * Academic Year ID Schema
 */
export const academicYearIdSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid Academic Year ID."),
  }),
});