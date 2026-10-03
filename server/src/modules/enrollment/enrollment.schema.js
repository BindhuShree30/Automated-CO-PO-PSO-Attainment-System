/**
 * ------------------------------------------------------------------
 * Enrollment Validation Schemas
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { z } from "zod";

/**
 * ------------------------------------------------------------------
 * UUID Helper
 * ------------------------------------------------------------------
 */

const uuidSchema = (fieldName) =>
    z
        .string()
        .uuid(`${fieldName} must be a valid UUID.`);

/**
 * ------------------------------------------------------------------
 * Create Enrollment Schema
 * ------------------------------------------------------------------
 */

export const createEnrollmentSchema = {
    body: z.object({
        studentId: uuidSchema("Student ID"),

        batchId: uuidSchema("Batch ID"),

        enrollmentDate: z
            .string()
            .date(
                "Enrollment date must be a valid date."
            )
            .optional(),

        status: z
            .boolean()
            .optional()
            .default(true),
    }),
};

/**
 * ------------------------------------------------------------------
 * Update Enrollment Schema
 * ------------------------------------------------------------------
 */

export const updateEnrollmentSchema = {
    params: z.object({
        id: uuidSchema("Enrollment ID"),
    }),

    body: z
        .object({
            studentId: uuidSchema("Student ID")
                .optional(),

            batchId: uuidSchema("Batch ID")
                .optional(),

            enrollmentDate: z
                .string()
                .date(
                    "Enrollment date must be a valid date."
                )
                .optional(),

            status: z
                .boolean()
                .optional(),
        })
        .refine(
            (data) =>
                Object.keys(data).length > 0,
            {
                message:
                    "At least one field must be provided to update.",
            }
        ),
};

/**
 * ------------------------------------------------------------------
 * Enrollment ID Schema
 * ------------------------------------------------------------------
 */

export const enrollmentIdSchema = {
    params: z.object({
        id: uuidSchema("Enrollment ID"),
    }),
};

/**
 * ------------------------------------------------------------------
 * Batch ID Parameter Schema
 *
 * Used for:
 * GET /enrollments/batch/:batchId
 * ------------------------------------------------------------------
 */

export const batchIdParamSchema = {
    params: z.object({
        batchId: uuidSchema("Batch ID"),
    }),
};

/**
 * ------------------------------------------------------------------
 * Student ID Parameter Schema
 *
 * Used for:
 * GET /enrollments/student/:studentId
 * ------------------------------------------------------------------
 */

export const studentIdParamSchema = {
    params: z.object({
        studentId: uuidSchema("Student ID"),
    }),
};