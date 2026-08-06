import { z } from "zod";

/**
 * ------------------------------------------------------------------
 * Create CO-PO Mapping Schema
 * ------------------------------------------------------------------
 */
export const createCOPOMappingSchema = z.object({
  body: z.object({
    courseOutcomeId: z
      .string()
      .uuid("Valid Course Outcome ID is required."),

    programOutcomeId: z
      .string()
      .uuid("Valid Program Outcome ID is required."),

    mappingLevel: z
      .number()
      .int("Mapping level must be an integer.")
      .min(1, "Mapping level must be between 1 and 3.")
      .max(3, "Mapping level must be between 1 and 3."),

    status: z.boolean().optional().default(true),
  }),
});

/**
 * ------------------------------------------------------------------
 * Update CO-PO Mapping Schema
 * ------------------------------------------------------------------
 */
export const updateCOPOMappingSchema = z.object({
  body: z.object({
    mappingLevel: z
      .number()
      .int()
      .min(1)
      .max(3)
      .optional(),

    status: z.boolean().optional(),
  }),
});

/**
 * ------------------------------------------------------------------
 * ID Parameter Schema
 * ------------------------------------------------------------------
 */
export const mappingIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid Mapping ID."),
  }),
});

/**
 * ------------------------------------------------------------------
 * Course Outcome ID Schema
 * ------------------------------------------------------------------
 */
export const courseOutcomeIdSchema = z.object({
  params: z.object({
    courseOutcomeId: z
      .string()
      .uuid("Invalid Course Outcome ID."),
  }),
});

/**
 * ------------------------------------------------------------------
 * Program Outcome ID Schema
 * ------------------------------------------------------------------
 */
export const programOutcomeIdSchema = z.object({
  params: z.object({
    programOutcomeId: z
      .string()
      .uuid("Invalid Program Outcome ID."),
  }),
});
/**
 * ------------------------------------------------------------------
 * Matrix Course Schema
 * ------------------------------------------------------------------
 */
export const matrixCourseSchema = z.object({
  params: z.object({
    courseId: z.string().uuid("Invalid Course ID."),
  }),
});

/**
 * ------------------------------------------------------------------
 * Save NBA Matrix Schema
 * ------------------------------------------------------------------
 */
export const saveMatrixSchema = z.object({
  body: z.object({
    matrix: z
      .array(
        z.object({
          courseOutcomeId: z
            .string()
            .uuid("Invalid Course Outcome ID."),

          programOutcomeId: z
            .string()
            .uuid("Invalid Program Outcome ID."),

          mappingLevel: z
            .number()
            .int("Mapping level must be an integer.")
            .min(0, "Mapping level must be between 0 and 3.")
            .max(3, "Mapping level must be between 0 and 3."),
        })
      )
      .min(1, "Matrix cannot be empty."),
  }),
});