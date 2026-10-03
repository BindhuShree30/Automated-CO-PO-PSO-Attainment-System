import { z } from "zod";

/**
 * Upload syllabus validation
 */
export const uploadSyllabusSchema =
  z.object({
    body: z.object({
      courseOfferingId: z
        .string()
        .uuid(
          "Invalid Course Offering ID."
        ),
    }),
  });

/**
 * Extract syllabus validation
 */
export const extractSyllabusSchema =
  z.object({
    params: z.object({
      syllabusId: z
        .string()
        .uuid(
          "Invalid Syllabus ID."
        ),
    }),
  });

export default {
  uploadSyllabusSchema,
  extractSyllabusSchema,
};