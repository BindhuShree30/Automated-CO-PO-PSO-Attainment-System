/**
 * ------------------------------------------------------------------
 * Course Offering Validation Schema
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { z } from "zod";

/**
 * Create Course Offering Schema
 */
export const createCourseOfferingSchema = z.object({
  body: z.object({
    courseId: z.uuid("Invalid Course ID."),

    batchId: z.uuid("Invalid Batch ID."),

    semesterId: z.uuid("Invalid Semester ID."),

    facultyId: z.uuid("Invalid Faculty ID."),

    section: z
      .string()
      .trim()
      .min(1, "Section cannot be empty.")
      .max(20, "Section cannot exceed 20 characters.")
      .optional()
      .nullable(),

    status: z.boolean().optional(),
  }),
});

/**
 * Update Course Offering Schema
 */
export const updateCourseOfferingSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid Course Offering ID."),
  }),

  body: z.object({
    courseId: z
      .uuid("Invalid Course ID.")
      .optional(),

    batchId: z
      .uuid("Invalid Batch ID.")
      .optional(),

    semesterId: z
      .uuid("Invalid Semester ID.")
      .optional(),

    facultyId: z
      .uuid("Invalid Faculty ID.")
      .optional(),

    section: z
      .string()
      .trim()
      .min(1, "Section cannot be empty.")
      .max(20, "Section cannot exceed 20 characters.")
      .optional()
      .nullable(),

    status: z.boolean().optional(),
  }),
});

/**
 * Course Offering ID Schema
 */
export const courseOfferingIdSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid Course Offering ID."),
  }),
});