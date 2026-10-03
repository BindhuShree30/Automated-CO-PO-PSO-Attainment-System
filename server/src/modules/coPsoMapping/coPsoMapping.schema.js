/**
 * ------------------------------------------------------------------
 * CO–PSO Mapping Validation Schema
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { z } from "zod";

/**
 * ------------------------------------------------------------------
 * Create CO–PSO Mapping
 * ------------------------------------------------------------------
 */
export const createCoPsoMappingSchema = {
  body: z.object({
    courseOutcomeId: z
      .string()
      .uuid(
        "Invalid Course Outcome ID."
      ),

    programSpecificOutcomeId: z
      .string()
      .uuid(
        "Invalid Program Specific Outcome ID."
      ),

    mappingLevel: z
      .number()
      .int(
        "Mapping level must be an integer."
      )
      .min(
        1,
        "Mapping level must be between 1 and 3."
      )
      .max(
        3,
        "Mapping level must be between 1 and 3."
      ),

    status: z
      .boolean()
      .optional(),
  }),
};

/**
 * ------------------------------------------------------------------
 * Update CO–PSO Mapping
 * ------------------------------------------------------------------
 */
export const updateCoPsoMappingSchema = {
  params: z.object({
    id: z
      .string()
      .uuid(
        "Invalid CO–PSO Mapping ID."
      ),
  }),

  body: z.object({
    courseOutcomeId: z
      .string()
      .uuid(
        "Invalid Course Outcome ID."
      )
      .optional(),

    programSpecificOutcomeId: z
      .string()
      .uuid(
        "Invalid Program Specific Outcome ID."
      )
      .optional(),

    mappingLevel: z
      .number()
      .int(
        "Mapping level must be an integer."
      )
      .min(1)
      .max(3)
      .optional(),

    status: z
      .boolean()
      .optional(),
  }),
};

/**
 * ------------------------------------------------------------------
 * Get / Delete Mapping By ID
 * ------------------------------------------------------------------
 */
export const coPsoMappingIdSchema = {
  params: z.object({
    id: z
      .string()
      .uuid(
        "Invalid CO–PSO Mapping ID."
      ),
  }),
};

/**
 * ------------------------------------------------------------------
 * Get Mappings By Course Outcome
 * ------------------------------------------------------------------
 */
export const courseOutcomeIdSchema = {
  params: z.object({
    courseOutcomeId: z
      .string()
      .uuid(
        "Invalid Course Outcome ID."
      ),
  }),
};

/**
 * ------------------------------------------------------------------
 * Get Mappings By Program Specific Outcome
 * ------------------------------------------------------------------
 */
export const programSpecificOutcomeIdSchema = {
  params: z.object({
    programSpecificOutcomeId: z
      .string()
      .uuid(
        "Invalid Program Specific Outcome ID."
      ),
  }),
};

/**
 * ------------------------------------------------------------------
 * Get CO–PSO Matrix
 * ------------------------------------------------------------------
 *
 * GET:
 * /api/v1/co-pso-mappings/matrix/:courseId
 * ------------------------------------------------------------------
 */
export const matrixCourseIdSchema = {
  params: z.object({
    courseId: z
      .string()
      .uuid(
        "Invalid Course ID."
      ),
  }),
};

/**
 * ------------------------------------------------------------------
 * Save CO–PSO Matrix
 * ------------------------------------------------------------------
 *
 * POST:
 * /api/v1/co-pso-mappings/matrix
 *
 * Only actual mappings are stored.
 *
 * 1 = Low
 * 2 = Medium
 * 3 = High
 *
 * Unmapped cells are represented as "-"
 * in the frontend and are not stored.
 * ------------------------------------------------------------------
 */
export const saveMatrixSchema = {
  body: z.object({
    courseId: z
      .string()
      .uuid(
        "Invalid Course ID."
      ),

    matrix: z.array(
      z.object({
        courseOutcomeId: z
          .string()
          .uuid(
            "Invalid Course Outcome ID."
          ),

        programSpecificOutcomeId: z
          .string()
          .uuid(
            "Invalid Program Specific Outcome ID."
          ),

        /**
         * The frontend may send:
         *
         * 1
         * 2
         * 3
         *
         * or "-" / null for an unmapped cell.
         *
         * The service removes unmapped
         * cells before saving.
         */
        mappingLevel: z
          .union([
            z
              .number()
              .int()
              .min(1)
              .max(3),

            z.string(),
          ])
          .nullable()
          .optional(),
      })
    ),
  }),
};