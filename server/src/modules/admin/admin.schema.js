/**
 * ------------------------------------------------------------------
 * Admin Validation Schema
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { z } from "zod";

export const userIdSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
};