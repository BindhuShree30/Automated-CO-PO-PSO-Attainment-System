/**
 * ------------------------------------------------------------------
 * Course Validation Schema
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Validates Course create, update, and ID requests.
 *
 * Course belongs to:
 *
 * Department
 * Program
 *
 * Program is required for:
 *
 * - Program Outcomes
 * - CO–PO Mapping
 * - CO–PSO Mapping
 * - Attainment Analysis
 *
 * ------------------------------------------------------------------
 */

import { z } from "zod";

/**
 * ------------------------------------------------------------------
 * Create Course Schema
 * ------------------------------------------------------------------
 */
export const createCourseSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(
        2,
        "Course name must be at least 2 characters."
      )
      .max(
        100,
        "Course name cannot exceed 100 characters."
      ),

    code: z
      .string()
      .trim()
      .min(
        2,
        "Course code must be at least 2 characters."
      )
      .max(
        20,
        "Course code cannot exceed 20 characters."
      ),

    credits: z
      .number()
      .int("Credits must be an integer.")
      .min(
        1,
        "Credits must be at least 1."
      )
      .max(
        10,
        "Credits cannot exceed 10."
      ),

    semester: z
      .number()
      .int("Semester must be an integer.")
      .min(
        1,
        "Semester must be at least 1."
      )
      .max(
        8,
        "Semester cannot exceed 8."
      ),

    /**
     * Department
     */
    departmentId: z.uuid(
      "Invalid Department ID."
    ),

    /**
     * Program
     *
     * Required because every course must belong
     * to a Program for OBE analysis.
     */
    programId: z.uuid(
      "Invalid Program ID."
    ),

    status: z
      .boolean()
      .optional(),
  }),
});

/**
 * ------------------------------------------------------------------
 * Update Course Schema
 * ------------------------------------------------------------------
 */
export const updateCourseSchema = z.object({
  params: z.object({
    id: z.uuid(
      "Invalid Course ID."
    ),
  }),

  body: z.object({
    name: z
      .string()
      .trim()
      .min(
        2,
        "Course name must be at least 2 characters."
      )
      .max(
        100,
        "Course name cannot exceed 100 characters."
      )
      .optional(),

    code: z
      .string()
      .trim()
      .min(
        2,
        "Course code must be at least 2 characters."
      )
      .max(
        20,
        "Course code cannot exceed 20 characters."
      )
      .optional(),

    credits: z
      .number()
      .int("Credits must be an integer.")
      .min(
        1,
        "Credits must be at least 1."
      )
      .max(
        10,
        "Credits cannot exceed 10."
      )
      .optional(),

    semester: z
      .number()
      .int("Semester must be an integer.")
      .min(
        1,
        "Semester must be at least 1."
      )
      .max(
        8,
        "Semester cannot exceed 8."
      )
      .optional(),

    departmentId: z
      .uuid(
        "Invalid Department ID."
      )
      .optional(),

    /**
     * Program
     */
    programId: z
      .uuid(
        "Invalid Program ID."
      )
      .optional(),

    status: z
      .boolean()
      .optional(),
  }),
});

/**
 * ------------------------------------------------------------------
 * Course ID Schema
 * ------------------------------------------------------------------
 */
export const courseIdSchema = z.object({
  params: z.object({
    id: z.uuid(
      "Invalid Course ID."
    ),
  }),
});