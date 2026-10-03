import { z } from "zod";

/**
 * ==================================================================
 * CURRICULUM ID
 * ==================================================================
 */

export const curriculumIdSchema = z.object({
  params: z.object({
    curriculumId: z.uuid("Invalid Curriculum ID."),
  }),
});

/**
 * ==================================================================
 * IMPORT ID
 * ==================================================================
 */

export const curriculumImportIdSchema = z.object({
  params: z.object({
    importId: z.uuid("Invalid Curriculum Import ID."),
  }),
});

/**
 * ==================================================================
 * IMPORT ROW ID
 * ==================================================================
 */

export const curriculumImportRowIdSchema = z.object({
  params: z.object({
    importId: z.uuid("Invalid Curriculum Import ID."),
    rowId: z.uuid("Invalid Curriculum Import Row ID."),
  }),

  body: z.object({
    semesterNumber: z
      .number()
      .int()
      .min(1)
      .max(8)
      .optional(),

    courseCode: z
      .string()
      .trim()
      .max(20)
      .nullable()
      .optional(),

    courseName: z
      .string()
      .trim()
      .min(1)
      .max(150)
      .optional(),

    credits: z
      .number()
      .min(0)
      .nullable()
      .optional(),

    courseType: z
      .string()
      .trim()
      .max(30)
      .nullable()
      .optional(),

    electiveGroup: z
      .string()
      .trim()
      .max(50)
      .nullable()
      .optional(),

    isCompulsory: z.boolean().optional(),

    sequenceNo: z
      .number()
      .int()
      .min(1)
      .optional(),
  }),
});