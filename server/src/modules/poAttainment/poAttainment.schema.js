import { z } from "zod";

const uuid = z.string().uuid("Invalid UUID format.");

export const createPOAttainmentSchema = z.object({
  body: z.object({
    courseOfferingId: uuid,
    programOutcomeId: uuid,
    attainmentValue: z
      .number({
        required_error: "Attainment value is required.",
      })
      .min(0, "Attainment value cannot be negative."),
    attainmentLevel: z
      .number({
        required_error: "Attainment level is required.",
      })
      .int()
      .min(1, "Attainment level must be between 1 and 3.")
      .max(3, "Attainment level must be between 1 and 3."),
    status: z.boolean().optional().default(true),
  }),
});

export const calculatePOAttainmentSchema = z.object({
  body: z.object({
    courseOfferingId: uuid,
    programOutcomeId: uuid.optional(),
  }),
});

export const updatePOAttainmentSchema = z.object({
  body: z.object({
    attainmentValue: z.number().min(0).optional(),
    attainmentLevel: z.number().int().min(1).max(3).optional(),
    status: z.boolean().optional(),
  }),
});

export const poAttainmentIdSchema = z.object({
  params: z.object({
    id: uuid,
  }),
});

export const courseOfferingIdParamSchema = z.object({
  params: z.object({
    courseOfferingId: uuid,
  }),
});

export const programOutcomeIdSchema = z.object({
  params: z.object({
    programOutcomeId: uuid,
  }),
});