import { z } from "zod";
import ROLES from "../../shared/constants/roles.js";

export const registerSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(2).max(100),

    lastName: z.string().trim().min(2).max(100),

    email: z.string().trim().email(),

    password: z
      .string()
      .min(8)
      .max(50)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/,
        "Password must contain uppercase, lowercase, number and special character"
      ),

    role: z.enum(Object.values(ROLES)).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),

    password: z.string().min(8),
  }),
});