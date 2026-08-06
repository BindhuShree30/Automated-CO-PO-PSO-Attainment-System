/**
 * ---------------------------------------------------------
 * Validation Middleware
 * ---------------------------------------------------------
 */

import { z } from "zod";

const validate = (schema) => {
  // Build a validator using only the schemas that are provided
  const validator = z.object({
    body: schema.body || z.object({}).passthrough(),
    params: schema.params || z.object({}).passthrough(),
    query: schema.query || z.object({}).passthrough(),
  });

  return (req, res, next) => {
    
    const result = validator.safeParse({
      body: req.body ?? {},
      params: req.params ?? {},
      query: req.query ?? {},
    });

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        data: null,
        error: errors,
      });
    }

    req.validatedData = result.data;

    next();
  };
};

export default validate;