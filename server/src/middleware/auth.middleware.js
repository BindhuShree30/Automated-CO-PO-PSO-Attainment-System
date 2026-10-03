import ApiError from "../shared/errors/ApiError.js";
import { verifyAccessToken } from "../shared/helpers/jwt.helper.js";
import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new ApiError(401, "Authorization token is required");
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw new ApiError(401, "Invalid authorization header format");
    }

    const token = parts[1];

    const decoded = verifyAccessToken(token);

    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new ApiError(401, "Access token has expired"));
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return next(new ApiError(401, "Invalid access token"));
    }

    next(error);
  }
};

export default authMiddleware;