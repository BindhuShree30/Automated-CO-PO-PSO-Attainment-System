/**
 * ------------------------------------------------------------------
 * Global Error Middleware
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 * Handles all application errors in one place.
 * ------------------------------------------------------------------
 */

import { ValidationError } from "sequelize";
import ApiError from "../shared/errors/ApiError.js";

const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  // Custom API Errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
      error: err.message,
    });
  }

  // Sequelize Validation Errors
  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      data: null,
      error: err.errors.map((e) => e.message),
    });
  }

  // Zod Validation Errors
  // Zod Validation Errors
if (err.name === "ZodError") {
  const issues = err.issues || err.errors || [];

  return res.status(400).json({
    success: false,
    message: "Validation failed.",
    data: null,
    error: issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    })),
  });
}

  // Unknown Errors
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    data: null,
    error: err.message || "Something went wrong",
  });
};

export default errorMiddleware;