import authService from "./auth.service.js";
import asyncHandler from "../../shared/helpers/asyncHandler.js";
import { successResponse } from "../../shared/helpers/apiResponse.js";

/**
 * Register User
 */
const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.validatedData.body);

  return successResponse(
    res,
    "User registered successfully.",
    user,
    201
  );
});

/**
 * Login User
 */
const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.validatedData.body);

  return successResponse(
    res,
    "Login successful.",
    result,
    200
  );
});

/**
 * Current User
 */
const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);

  return successResponse(
    res,
    "User profile fetched successfully.",
    user
  );
});

export default {
  register,
  login,
  me,
};