/**
 * ------------------------------------------------------------------
 * Student Validation Schema
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { z } from "zod";

/**
 * ------------------------------------------------------------------
 * Student Body Schema
 * ------------------------------------------------------------------
 */

const studentBodySchema = z.object({
    usn: z
        .string()
        .trim()
        .min(5, "USN must be at least 5 characters.")
        .max(20, "USN cannot exceed 20 characters."),

    firstName: z
        .string()
        .trim()
        .min(2, "First name must be at least 2 characters.")
        .max(100, "First name cannot exceed 100 characters."),

    lastName: z
        .string()
        .trim()
        .min(2, "Last name must be at least 2 characters.")
        .max(100, "Last name cannot exceed 100 characters."),

    email: z
        .string()
        .trim()
        .email("Invalid email address.")
        .max(150, "Email cannot exceed 150 characters."),

    phone: z
        .string()
        .trim()
        .min(7, "Phone number must be at least 7 characters.")
        .max(15, "Phone number cannot exceed 15 characters.")
        .optional(),

    departmentId: z
        .uuid("Invalid Department ID."),

    semesterId: z
        .uuid("Invalid Semester ID."),
});

/**
 * ------------------------------------------------------------------
 * Create Student Schema
 * ------------------------------------------------------------------
 */

export const createStudentSchema = z.object({
    body: studentBodySchema,
});

/**
 * ------------------------------------------------------------------
 * Update Student Schema
 * ------------------------------------------------------------------
 */

export const updateStudentSchema = z.object({
    params: z.object({
        id: z.uuid("Invalid Student ID."),
    }),

    body: studentBodySchema.partial(),
});

/**
 * ------------------------------------------------------------------
 * Student ID Schema
 * ------------------------------------------------------------------
 */

export const studentIdSchema = z.object({
    params: z.object({
        id: z.uuid("Invalid Student ID."),
    }),
});