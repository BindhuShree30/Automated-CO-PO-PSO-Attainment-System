/**
 * ------------------------------------------------------------------
 * Faculty Validation Schema
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { z } from "zod";

/**
 * Create Faculty Schema
 */
export const createFacultySchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters.")
      .max(100, "First name cannot exceed 100 characters."),

    lastName: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters.")
      .max(100, "Last name cannot exceed 100 characters."),

    email: z
      .string()
      .trim()
      .email("Invalid email address."),

    phone: z
      .string()
      .trim()
      .optional(),

    employeeId: z
      .string()
      .trim()
      .min(2, "Employee ID must be at least 2 characters.")
      .max(20, "Employee ID cannot exceed 20 characters."),

    designation: z
      .string()
      .trim()
      .min(2, "Designation must be at least 2 characters.")
      .max(100, "Designation cannot exceed 100 characters."),

    departmentId: z.uuid("Invalid Department ID."),

    status: z.boolean().optional(),
  }),
});

/**
 * Update Faculty Schema
 */
export const updateFacultySchema = z.object({
  params: z.object({
    id: z.uuid("Invalid Faculty ID."),
  }),

  body: z.object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters.")
      .max(100, "First name cannot exceed 100 characters.")
      .optional(),

    lastName: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters.")
      .max(100, "Last name cannot exceed 100 characters.")
      .optional(),

    email: z
      .string()
      .trim()
      .email("Invalid email address.")
      .optional(),

    phone: z
      .string()
      .trim()
      .optional(),

    employeeId: z
      .string()
      .trim()
      .min(2, "Employee ID must be at least 2 characters.")
      .max(20, "Employee ID cannot exceed 20 characters.")
      .optional(),

    designation: z
      .string()
      .trim()
      .min(2, "Designation must be at least 2 characters.")
      .max(100, "Designation cannot exceed 100 characters.")
      .optional(),

    departmentId: z
      .uuid("Invalid Department ID.")
      .optional(),

    status: z.boolean().optional(),
  }),
});

/**
 * Faculty ID Schema
 */
export const facultyIdSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid Faculty ID."),
  }),
});