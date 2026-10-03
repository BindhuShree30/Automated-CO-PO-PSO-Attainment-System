/**
 * ------------------------------------------------------------------
 * Faculty Assignment Validation Schema
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { z } from "zod";

/**
 * ------------------------------------------------------------------
 * Create Assignment
 * ------------------------------------------------------------------
 */

export const createFacultyAssignmentSchema =
  z.object({
    body: z.object({
      facultyId: z
        .string()
        .uuid(
          "Invalid Faculty ID."
        ),

      courseOfferingId: z
        .string()
        .uuid(
          "Invalid Course Offering ID."
        ),

      status: z
        .boolean()
        .optional()
        .default(true),
    }),
  });

/**
 * ------------------------------------------------------------------
 * Update Assignment
 * ------------------------------------------------------------------
 */

export const updateFacultyAssignmentSchema =
  z.object({
    params: z.object({
      id: z
        .string()
        .uuid(
          "Invalid Faculty Assignment ID."
        ),
    }),

    body: z.object({
      facultyId: z
        .string()
        .uuid(
          "Invalid Faculty ID."
        )
        .optional(),

      courseOfferingId: z
        .string()
        .uuid(
          "Invalid Course Offering ID."
        )
        .optional(),

      status: z
        .boolean()
        .optional(),
    }),
  });

/**
 * ------------------------------------------------------------------
 * Assignment ID
 * ------------------------------------------------------------------
 */

export const facultyAssignmentIdSchema =
  z.object({
    params: z.object({
      id: z
        .string()
        .uuid(
          "Invalid Faculty Assignment ID."
        ),
    }),
  });

export default {
  createFacultyAssignmentSchema,
  updateFacultyAssignmentSchema,
  facultyAssignmentIdSchema,
};