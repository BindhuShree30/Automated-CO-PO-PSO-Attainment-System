/**
 * ------------------------------------------------------------------
 * Department Validation Schema
 * ------------------------------------------------------------------
 */

import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Department name must be at least 2 characters")
    .max(100, "Department name cannot exceed 100 characters"),

  code: z
    .string()
    .trim()
    .min(2, "Department code must be at least 2 characters")
    .max(20, "Department code cannot exceed 20 characters"),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();