import { z } from "zod";

export const createProgramSchema = z.object({
  name: z.string().min(2).max(100),

  code: z.string().min(2).max(20),

  duration: z.number().min(1).max(10),

  departmentId: z.uuid(),
});

export const updateProgramSchema =
  createProgramSchema.partial();