

import { z } from "zod";

/**
 * UUID Parameter Schema
 */
const uuidSchema = z
  .string()
  .uuid("Invalid UUID");

/**
 * Create Assessment Question
 */
export const createAssessmentQuestionSchema = z.object({
  body: z.object({
    assessmentId: uuidSchema,

    courseOutcomeId: uuidSchema,

    questionNumber: z
      .string()
      .trim()
      .min(
        1,
        "Question number is required"
      )
      .max(
        20,
        "Question number must not exceed 20 characters"
      ),

    description: z
      .string()
      .trim()
      .max(
        1000,
        "Description must not exceed 1000 characters"
      )
      .optional(),

    maxMarks: z.coerce
      .number()
      .positive(
        "Maximum marks must be greater than 0"
      ),

    status: z
      .boolean()
      .optional(),
  }),
});

/**
 * Update Assessment Question
 */
export const updateAssessmentQuestionSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),

  body: z
    .object({
      assessmentId: uuidSchema.optional(),

      courseOutcomeId: uuidSchema.optional(),

      questionNumber: z
        .string()
        .trim()
        .min(
          1,
          "Question number is required"
        )
        .max(
          20,
          "Question number must not exceed 20 characters"
        )
        .optional(),

      description: z
        .string()
        .trim()
        .max(
          1000,
          "Description must not exceed 1000 characters"
        )
        .optional(),

      maxMarks: z.coerce
        .number()
        .positive(
          "Maximum marks must be greater than 0"
        )
        .optional(),

      status: z
        .boolean()
        .optional(),
    })
    .refine(
      (data) =>
        Object.keys(data).length > 0,
      {
        message:
          "At least one field is required for update",
      }
    ),
});

/**
 * Assessment Question ID Parameter
 */
export const assessmentQuestionIdSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

/**
 * Assessment ID Parameter
 */
export const assessmentQuestionsByAssessmentSchema =
  z.object({
    params: z.object({
      assessmentId: uuidSchema,
    }),
  });

/**
 * Course Outcome ID Parameter
 */
export const assessmentQuestionsByCourseOutcomeSchema =
  z.object({
    params: z.object({
      courseOutcomeId: uuidSchema,
    }),
  });