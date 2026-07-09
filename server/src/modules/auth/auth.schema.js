/**
 * ------------------------------------------------------------------
 * Authentication Validation Schema
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 * Contains validation schemas for authentication requests.
 * ------------------------------------------------------------------
 */

import { z } from "zod";
import ROLES from "../../shared/constants/roles.js";

/**
 * Register User Schema
 */
export const registerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(100, "First name cannot exceed 100 characters"),

  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(100, "Last name cannot exceed 100 characters"),

  email: z
    .string()
    .trim()
    .email("Invalid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password cannot exceed 50 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/,
      "Password must contain uppercase, lowercase, number and special character"
    ),

  role: z.enum(Object.values(ROLES)).optional(),
});

/**
 * Login Schema
 */
export const loginSchema = z.object({
    email: z
      .string()
      .trim()
      .email("Invalid email address"),
  
    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  });