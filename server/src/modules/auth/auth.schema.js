/**
 * ---------------------------------------------------------
 * Authentication Validation Schemas
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ---------------------------------------------------------
 *
 * Public Registration:
 * - Faculty only
 *
 * Registration creates:
 *
 * users:
 *   role   = FACULTY
 *   status = PENDING
 *
 * faculties:
 *   status = false
 *
 * HOD registration is NOT allowed through public
 * registration.
 * ---------------------------------------------------------
 */

import { z } from "zod";

/**
 * ---------------------------------------------------------
 * Faculty Registration Schema
 * ---------------------------------------------------------
 */
export const registerSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .trim()
      .min(
        2,
        "First name must contain at least 2 characters."
      )
      .max(
        50,
        "First name must not exceed 50 characters."
      ),

    lastName: z
      .string()
      .trim()
      .min(
        1,
        "Last name is required."
      )
      .max(
        50,
        "Last name must not exceed 50 characters."
      ),

    email: z
      .string()
      .trim()
      .email(
        "Enter a valid email address."
      )
      .max(
        100,
        "Email must not exceed 100 characters."
      )
      .transform((value) =>
        value.toLowerCase()
      ),

    phone: z
      .string()
      .trim()
      .regex(
        /^[0-9]{10,15}$/,
        "Phone number must contain 10 to 15 digits."
      ),

    employeeId: z
      .string()
      .trim()
      .min(
        2,
        "Employee ID must contain at least 2 characters."
      )
      .max(
        20,
        "Employee ID must not exceed 20 characters."
      )
      .transform((value) =>
        value.toUpperCase()
      ),

    designation: z
      .string()
      .trim()
      .min(
        2,
        "Designation is required."
      )
      .max(
        100,
        "Designation must not exceed 100 characters."
      ),

    departmentId: z.uuid(
      "Invalid Department ID."
    ),

    password: z
      .string()
      .min(
        8,
        "Password must contain at least 8 characters."
      )
      .max(
        100,
        "Password must not exceed 100 characters."
      ),
  }),
});

/**
 * ---------------------------------------------------------
 * Login Schema
 * ---------------------------------------------------------
 */
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .email(
        "Enter a valid email address."
      )
      .max(
        100,
        "Email must not exceed 100 characters."
      )
      .transform((value) =>
        value.toLowerCase()
      ),

    password: z
      .string()
      .min(
        1,
        "Password is required."
      ),

    selectedRole: z.enum(
      ["HOD", "FACULTY"],
      {
        message:
          "Please select HOD or Faculty.",
      }
    ),
  }),
});

export default {
  registerSchema,
  loginSchema,
};