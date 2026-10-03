/**
 * ------------------------------------------------------------------
 * Course Registration Validation Schema
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { z } from "zod";

/**
 * ------------------------------------------------------------------
 * UUID Schema Helper
 * ------------------------------------------------------------------
 */

const uuidSchema = (fieldName) =>
    z
        .string()
        .uuid(`${fieldName} must be a valid UUID.`);

/**
 * ------------------------------------------------------------------
 * Course Registration Body Schema
 * ------------------------------------------------------------------
 *
 * Used for creating a single course enrollment.
 *
 * Faculty sends:
 *
 * {
 *     studentId,
 *     courseOfferingId,
 *     registrationDate,
 *     status
 * }
 *
 * ------------------------------------------------------------------
 */

const courseRegistrationBodySchema = z.object({

    studentId: uuidSchema("Student ID"),

    courseOfferingId:
        uuidSchema("Course Offering ID"),

    registrationDate: z
        .string()
        .date(
            "Registration date must be a valid date."
        ),

    status: z
        .boolean()
        .optional()
        .default(true),
});

/**
 * ------------------------------------------------------------------
 * Create Course Registration Schema
 * ------------------------------------------------------------------
 */

export const createCourseRegistrationSchema =
    z.object({

        body:
            courseRegistrationBodySchema,

    });

/**
 * ------------------------------------------------------------------
 * Update Course Registration Schema
 * ------------------------------------------------------------------
 */

export const updateCourseRegistrationSchema =
    z.object({

        params: z.object({

            id:
                uuidSchema(
                    "Course Registration ID"
                ),

        }),

        body:
            courseRegistrationBodySchema
                .partial()
                .refine(
                    (data) =>
                        Object.keys(data).length > 0,
                    {
                        message:
                            "At least one field is required for update.",
                    }
                ),

    });

/**
 * ------------------------------------------------------------------
 * Course Registration ID Schema
 * ------------------------------------------------------------------
 */

export const courseRegistrationIdSchema =
    z.object({

        params: z.object({

            id:
                uuidSchema(
                    "Course Registration ID"
                ),

        }),

    });

/**
 * ------------------------------------------------------------------
 * Course Offering ID Parameter Schema
 * ------------------------------------------------------------------
 *
 * Used by:
 *
 * GET
 * /course-offering/:courseOfferingId
 *
 * ------------------------------------------------------------------
 */

export const courseOfferingIdParamSchema =
    z.object({

        params: z.object({

            courseOfferingId:
                uuidSchema(
                    "Course Offering ID"
                ),

        }),

    });