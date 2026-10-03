/**
 * ------------------------------------------------------------------
 * Student Question Mark Validation Schema
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { z } from "zod";

/**
 * ------------------------------------------------------------------
 * Create Student Question Mark Schema
 * ------------------------------------------------------------------
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
      .min(
        0,
        "Marks obtained cannot be negative."
      ),

    isAbsent: z
      .boolean()
      .optional()
      .default(false),

    isAttempted: z
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
 * ------------------------------------------------------------------
 * Update Student Question Mark Schema
 * ------------------------------------------------------------------
 */

export const updateStudentQuestionMarkSchema =
  z.object({
    body: z
      .object({
        marksObtained: z.coerce
          .number()
          .min(
            0,
            "Marks obtained cannot be negative."
          )
          .optional(),

        isAbsent: z
          .boolean()
          .optional(),

        isAttempted: z
          .boolean()
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
            "At least one field is required for update.",
        }
      ),
  });

/**
 * ------------------------------------------------------------------
 * Get Marks By Assessment And Student Schema
 * ------------------------------------------------------------------
 */

export const assessmentStudentMarksSchema =
  z.object({
    params: z.object({
      assessmentId: z
        .string()
        .uuid("Invalid Assessment ID."),

      studentId: z
        .string()
        .uuid("Invalid Student ID."),
    }),
  });

/**
 * ------------------------------------------------------------------
 * Bulk Student Marks Schema
 * ------------------------------------------------------------------
 *
 * One complete main question is selected
 * for each OR group.
 *
 * Example:
 *
 * part1 → Q1
 * part2 → Q3
 * part3 → Q5
 *
 * Q1 means Q1(a) + Q1(b) + Q1(c).
 * Q3 means Q3(a) + Q3(b) + Q3(c).
 * Q5 means Q5.
 *
 * ------------------------------------------------------------------
 */

export const bulkStudentMarksSchema =
  z.object({
    params: z.object({
      assessmentId: z
        .string()
        .uuid("Invalid Assessment ID."),

      studentId: z
        .string()
        .uuid("Invalid Student ID."),
    }),

    body: z.object({
      selectedQuestions: z.object({
        part1: z
          .number()
          .int()
          .refine(
            (value) =>
              value === 1 ||
              value === 2,
            {
              message:
                "Part 1 must select Q1 or Q2.",
            }
          ),

        part2: z
          .number()
          .int()
          .refine(
            (value) =>
              value === 3 ||
              value === 4,
            {
              message:
                "Part 2 must select Q3 or Q4.",
            }
          ),

        part3: z
          .number()
          .int()
          .refine(
            (value) =>
              value === 5 ||
              value === 6,
            {
              message:
                "Part 3 must select Q5 or Q6.",
            }
          ),
      }),

      marks: z
        .array(
          z.object({
            assessmentQuestionId: z
              .string()
              .uuid(
                "Invalid Assessment Question ID."
              ),

            marksObtained: z.coerce
              .number()
              .min(
                0,
                "Marks obtained cannot be negative."
              ),

            isAbsent: z
              .boolean()
              .default(false),

            isAttempted: z
              .boolean()
              .default(false),
          })
        )
        .min(
          1,
          "At least one mark entry is required."
        ),
    }),
  });