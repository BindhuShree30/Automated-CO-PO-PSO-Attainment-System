/**
 * ------------------------------------------------------------------
 * CO Attainment Validation Schema
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { z } from "zod";

/**
 * Calculate CO Attainment Schema
 */
export const calculateCOAttainmentSchema = z.object({
  body: z.object({
    courseOfferingId: z
      .string({ required_error: "Course Offering ID is required" })
      .uuid("Invalid Course Offering ID"),

    courseOutcomeId: z
      .string()
      .uuid("Invalid Course Outcome ID")
      .optional(),
  }),
});