/**
 * ------------------------------------------------------------------
 * Course Registration Validation Schema
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { z } from "zod";

/**
 * Course Registration Body Schema
 */
const courseRegistrationBodySchema = z.object({
  studentId: z.uuid("Invalid Student ID."),

  courseOfferingId: z.uuid(
    "Invalid Course Offering ID."
  ),

  registrationDate: z.iso.date(
    "Invalid Registration Date."
  ),

  status: z.boolean().optional(),
});

/**
 * Create Course Registration Schema
 */
export const createCourseRegistrationSchema = z.object({
  body: courseRegistrationBodySchema,
});

/**
 * Update Course Registration Schema
 */
export const updateCourseRegistrationSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid Course Registration ID."),
  }),

  body: courseRegistrationBodySchema
    .partial()
    .refine(
      (data) => Object.keys(data).length > 0,
      {
        message:
          "At least one field is required for update.",
      }
    ),
});

/**
 * Course Registration ID Schema
 */
export const courseRegistrationIdSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid Course Registration ID."),
  }),
});