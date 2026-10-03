/**
 * ------------------------------------------------------------------
 * Role Authorization Middleware
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 * Allows access only to specified roles.
 * ------------------------------------------------------------------
 */

import ApiError from "../shared/errors/ApiError.js";

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check authentication
      if (!req.user) {
        throw new ApiError(401, "Unauthorized");
      }

      // Check role
      if (!allowedRoles.includes(req.user.role)) {
        throw new ApiError(
          403,
          "You do not have permission to access this resource."
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default authorize;