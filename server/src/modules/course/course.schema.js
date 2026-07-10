/**
 * ------------------------------------------------------------------
 * Course Validation Schema
 * ------------------------------------------------------------------
 */

import { z } from "zod";

export const createCourseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Course name must be at least 2 characters")
    .max(100, "Course name cannot exceed 100 characters"),

  code: z
    .string()
    .trim()
    .min(2, "Course code must be at least 2 characters")
    .max(20, "Course code cannot exceed 20 characters"),

  credits: z
    .number({
      required_error: "Credits are required",
    })
    .int()
    .min(1)
    .max(10),

  semester: z
    .number({
      required_error: "Semester is required",
    })
    .int()
    .min(1)
    .max(8),

  programId: z
    .string()
    .uuid("Invalid Program ID"),
});

export const updateCourseSchema =
  createCourseSchema.partial();