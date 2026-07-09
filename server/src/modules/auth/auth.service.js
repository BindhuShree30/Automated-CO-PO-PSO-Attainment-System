/**
 * ------------------------------------------------------------------
 * Authentication Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 * Handles authentication business logic.
 * ------------------------------------------------------------------
 */

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "../../config/env.config.js";
import authRepository from "./auth.repository.js";
import ROLES from "../../shared/constants/roles.js";
import ApiError from "../../shared/errors/ApiError.js";
/**
 * Register a new user
 */
const registerUser = async (userData) => {
  const { firstName, lastName, email, password, role } = userData;

  // Check if email already exists
  const existingUser = await authRepository.findUserByEmail(email);

  if (existingUser) {
    throw new ApiError(409, "Email already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await authRepository.createUser({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role: role || ROLES.FACULTY,
  });

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
};
/**
 * Login User
 */
const loginUser = async ({ email, password }) => {
    // Find user
    const user = await authRepository.findUserByEmail(email);
  
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }
  
    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
  
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password");
    }
    
  
    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      env.jwt.secret,
      {
        expiresIn: env.jwt.expiresIn,
      }
    );
  
    return {
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  };
  /**
 * Get Current Logged-in User
 */
const getCurrentUser = async (userId) => {
  const user = await authRepository.findUserById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
};

export default {
  registerUser,
  loginUser,
  getCurrentUser,
};