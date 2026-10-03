import { z } from "zod";

/**
 * Create PSO
 */
export const createProgramSpecificOutcomeSchema = {
  body: z.object({
    programId: z.string().uuid("Invalid Program ID."),

    code: z
      .string()
      .trim()
      .min(1, "PSO code is required.")
      .max(20, "PSO code cannot exceed 20 characters."),

    description: z
      .string()
      .trim()
      .min(5, "Description must be at least 5 characters."),

    status: z.boolean().optional(),
  }),
};

/**
 * Update PSO
 */
export const updateProgramSpecificOutcomeSchema = {
  params: z.object({
    id: z.string().uuid("Invalid PSO ID."),
  }),

  body: z.object({
    programId: z.string().uuid().optional(),

    code: z
      .string()
      .trim()
      .min(1)
      .max(20)
      .optional(),

    description: z
      .string()
      .trim()
      .min(5)
      .optional(),

    status: z.boolean().optional(),
  }),
};

/**
 * Get/Delete by ID
 */
export const programSpecificOutcomeIdSchema = {
  params: z.object({
    id: z.string().uuid("Invalid PSO ID."),
  }),
};

/**
 * Get by Program ID
 */
export const programIdSchema = {
  params: z.object({
    programId: z.string().uuid("Invalid Program ID."),
  }),
};