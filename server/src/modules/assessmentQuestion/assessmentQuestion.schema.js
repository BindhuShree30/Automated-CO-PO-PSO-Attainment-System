/**
 * ------------------------------------------------------------------
 * Assessment Question Validation Schema
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { z } from "zod";

/**
 * Assessment Question Body
 */
const assessmentQuestionBodySchema =
  z.object({
    assessmentId: z.uuid(
      "Invalid Assessment ID."
    ),

    courseOutcomeId: z.uuid(
      "Invalid Course Outcome ID."
    ),

    questionNumber: z
      .string()
      .trim()
      .min(
        1,
        "Question number is required."
      )
      .max(
        20,
        "Question number cannot exceed 20 characters."
      ),

    description: z
      .string()
      .trim()
      .max(
        5000,
        "Question description is too long."
      )
      .optional()
      .nullable(),

    maxMarks: z.coerce
      .number()
      .positive(
        "Maximum marks must be greater than 0."
      )
      .max(
        999999.99,
        "Maximum marks value is too large."
      ),

    status: z.boolean().optional(),
  });

/**
 * Create Question
 */
export const createAssessmentQuestionSchema =
  z.object({
    body: assessmentQuestionBodySchema,
  });

/**
 * Update Question
 */
export const updateAssessmentQuestionSchema =
  z.object({
    params: z.object({
      id: z.uuid(
        "Invalid Assessment Question ID."
      ),
    }),

    body: assessmentQuestionBodySchema
      .partial()
      .omit({
        assessmentId: true,
      })
      .refine(
        (data) =>
          Object.keys(data).length > 0,
        {
          message:
            "At least one field is required for update.",
        }
      ),
  });

/**
 * Question ID
 */
export const assessmentQuestionIdSchema =
  z.object({
    params: z.object({
      id: z.uuid(
        "Invalid Assessment Question ID."
      ),
    }),
  });

/**
 * Questions By Assessment
 */
export const assessmentQuestionsByAssessmentSchema =
  z.object({
    params: z.object({
      assessmentId: z.uuid(
        "Invalid Assessment ID."
      ),
    }),
  });

export default {
  createAssessmentQuestionSchema,
  updateAssessmentQuestionSchema,
  assessmentQuestionIdSchema,
  assessmentQuestionsByAssessmentSchema,
};