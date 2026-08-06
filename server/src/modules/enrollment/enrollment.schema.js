/**
 * ------------------------------------------------------------------
 * Enrollment Validation Schema
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { z } from "zod";

/**
 * Create Enrollment Schema
 */
export const createEnrollmentSchema = z.object({
  body: z.object({
    studentId: z.uuid("Invalid Student ID."),

    batchId: z.uuid("Invalid Batch ID."),

    enrollmentDate: z
      .string()
      .date("Invalid Enrollment Date."),

    status: z.boolean().optional(),
  }),
});

/**
 * Update Enrollment Schema
 */
export const updateEnrollmentSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid Enrollment ID."),
  }),

  body: z.object({
    studentId: z
      .uuid("Invalid Student ID.")
      .optional(),

    batchId: z
      .uuid("Invalid Batch ID.")
      .optional(),

    enrollmentDate: z
      .string()
      .date("Invalid Enrollment Date.")
      .optional(),

    status: z.boolean().optional(),
  }),
});

/**
 * Enrollment ID Schema
 */
export const enrollmentIdSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid Enrollment ID."),
  }),
});