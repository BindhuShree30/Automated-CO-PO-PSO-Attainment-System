/**
 * ------------------------------------------------------------------
 * Semester Validation Schema
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { z } from "zod";

/**
 * Create Semester Schema
 */
export const createSemesterSchema = z.object({
  body: z.object({
    semesterNumber: z
      .number({
        required_error: "Semester Number is required.",
      })
      .int("Semester Number must be an integer.")
      .min(1, "Semester Number must be at least 1."),

    batchId: z.uuid("Invalid Batch ID."),

    academicYearId: z.uuid(
      "Invalid Academic Year ID."
    ),

    startDate: z
      .string()
      .date("Invalid Start Date. Use YYYY-MM-DD format.")
      .optional(),

    endDate: z
      .string()
      .date("Invalid End Date. Use YYYY-MM-DD format.")
      .optional(),

    isCurrent: z.boolean().optional(),

    status: z.boolean().optional(),
  }),
});

/**
 * Update Semester Schema
 */
export const updateSemesterSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid Semester ID."),
  }),

  body: z.object({
    semesterNumber: z
      .number()
      .int("Semester Number must be an integer.")
      .min(1, "Semester Number must be at least 1.")
      .optional(),

    batchId: z
      .uuid("Invalid Batch ID.")
      .optional(),

    academicYearId: z
      .uuid("Invalid Academic Year ID.")
      .optional(),

    startDate: z
      .string()
      .date("Invalid Start Date. Use YYYY-MM-DD format.")
      .optional(),

    endDate: z
      .string()
      .date("Invalid End Date. Use YYYY-MM-DD format.")
      .optional(),

    isCurrent: z.boolean().optional(),

    status: z.boolean().optional(),
  }),
});

/**
 * Semester ID Schema
 */
export const semesterIdSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid Semester ID."),
  }),
});