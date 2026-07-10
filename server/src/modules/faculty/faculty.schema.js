/**
 * ------------------------------------------------------------------
 * Faculty Validation Schema
 * ------------------------------------------------------------------
 */

import { z } from "zod";

export const createFacultySchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(100),

  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(100),

  email: z
    .string()
    .email("Invalid email address"),

  phone: z
    .string()
    .trim()
    .optional(),

  employeeId: z
    .string()
    .trim()
    .min(2)
    .max(20),

  designation: z
    .string()
    .trim()
    .min(2)
    .max(100),

  departmentId: z
    .string()
    .uuid("Invalid Department ID"),
});

export const updateFacultySchema =
  createFacultySchema.partial();