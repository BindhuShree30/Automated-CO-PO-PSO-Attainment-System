/**
 * ------------------------------------------------------------------
 * Authentication Middleware
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 * Verifies JWT access token and attaches authenticated user
 * to the request object.
 * ------------------------------------------------------------------
 */

import ApiError from "../shared/errors/ApiError.js";
import { verifyAccessToken } from "../shared/helpers/jwt.helper.js";

const authMiddleware = (req, res, next) => {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new ApiError(401, "Authorization token is required");
    }

    // Expected format:
    // Authorization: Bearer <token>
    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw new ApiError(
        401,
        "Invalid authorization header format"
      );
    }

    // Extract token
    const token = parts[1];

    // Debug logs (temporary)
    console.log("Authorization Header:", authHeader);
    console.log("Token:", token);

    // Verify JWT
    const decoded = verifyAccessToken(token);

    // Attach user to request
    req.user = decoded;

    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;