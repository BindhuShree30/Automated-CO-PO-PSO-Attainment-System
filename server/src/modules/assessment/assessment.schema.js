/**
 * ------------------------------------------------------------------
 * Assessment Validation Schema
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { z } from "zod";

/**
 * Assessment Body Schema
 */
const assessmentBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      2,
      "Assessment name must be at least 2 characters."
    )
    .max(
      100,
      "Assessment name cannot exceed 100 characters."
    ),

  type: z.enum([
    "CIE",
    "SEE",
    "ASSIGNMENT",
    "QUIZ",
    "LAB",
    "PROJECT",
  ]),

  courseOfferingId: z.uuid(
    "Invalid Course Offering ID."
  ),

  maxMarks: z.coerce
    .number()
    .positive(
      "Maximum marks must be greater than 0."
    )
    .max(
      999999.99,
      "Maximum marks value is too large."
    ),

  weightage: z.coerce
    .number()
    .positive(
      "Assessment weightage must be greater than 0."
    )
    .max(
      100,
      "Assessment weightage cannot exceed 100."
    ),

  assessmentDate: z.iso.date(
    "Invalid Assessment Date."
  ),

  status: z.boolean().optional(),
});

/**
 * Create Assessment Schema
 */
export const createAssessmentSchema = z.object({
  body: assessmentBodySchema,
});

/**
 * Update Assessment Schema
 */
export const updateAssessmentSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid Assessment ID."),
  }),

  body: assessmentBodySchema
    .partial()
    .refine(
      (data) => Object.keys(data).length > 0,
      {
        message:
          "At least one field is required for update.",
      }
    ),
});

/**
 * Assessment ID Schema
 */
export const assessmentIdSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid Assessment ID."),
  }),
});

/**
 * Course Offering Assessment Query Schema
 */
export const courseOfferingAssessmentSchema =
  z.object({
    params: z.object({
      courseOfferingId: z.uuid(
        "Invalid Course Offering ID."
      ),
    }),
  });