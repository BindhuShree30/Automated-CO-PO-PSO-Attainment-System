/**
 * ------------------------------------------------------------------
 * Student Question Mark Validation Schema
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { z } from "zod";

/**
 * Create Student Question Mark Schema
 */
export const createStudentQuestionMarkSchema = z.object({
  body: z.object({
    studentId: z
      .string()
      .uuid("Invalid Student ID"),

    assessmentQuestionId: z
      .string()
      .uuid("Invalid Assessment Question ID"),

    marksObtained: z.coerce
      .number()
      .min(0, "Marks obtained cannot be negative."),

    isAbsent: z
      .boolean()
      .optional()
      .default(false),

    status: z
      .boolean()
      .optional()
      .default(true),
  }),
});

/**
 * Update Student Question Mark Schema
 */
export const updateStudentQuestionMarkSchema = z.object({
  body: z
    .object({
      marksObtained: z.coerce
        .number()
        .min(0, "Marks obtained cannot be negative.")
        .optional(),

      isAbsent: z
        .boolean()
        .optional(),

      status: z
        .boolean()
        .optional(),
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      {
        message: "At least one field is required for update.",
      }
    ),
});