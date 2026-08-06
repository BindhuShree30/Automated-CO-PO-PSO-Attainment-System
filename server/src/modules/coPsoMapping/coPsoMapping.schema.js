import { z } from "zod";

/**
 * Create CO-PSO Mapping
 */
export const createCoPsoMappingSchema = {
  body: z.object({
    courseOutcomeId: z.string().uuid("Invalid Course Outcome ID."),

    programSpecificOutcomeId: z
      .string()
      .uuid("Invalid Program Specific Outcome ID."),

    mappingLevel: z
      .number()
      .int()
      .min(1, "Mapping level must be between 1 and 3.")
      .max(3, "Mapping level must be between 1 and 3."),

    status: z.boolean().optional(),
  }),
};

/**
 * Update CO-PSO Mapping
 */
export const updateCoPsoMappingSchema = {
  params: z.object({
    id: z.string().uuid("Invalid CO-PSO Mapping ID."),
  }),

  body: z.object({
    courseOutcomeId: z.string().uuid().optional(),

    programSpecificOutcomeId: z.string().uuid().optional(),

    mappingLevel: z.number().int().min(1).max(3).optional(),

    status: z.boolean().optional(),
  }),
};

/**
 * Get/Delete by ID
 */
export const coPsoMappingIdSchema = {
  params: z.object({
    id: z.string().uuid("Invalid CO-PSO Mapping ID."),
  }),
};

/**
 * Get by Course Outcome
 */
export const courseOutcomeIdSchema = {
  params: z.object({
    courseOutcomeId: z.string().uuid("Invalid Course Outcome ID."),
  }),
};

/**
 * Get by Program Specific Outcome
 */
export const programSpecificOutcomeIdSchema = {
  params: z.object({
    programSpecificOutcomeId: z
      .string()
      .uuid("Invalid Program Specific Outcome ID."),
  }),
};