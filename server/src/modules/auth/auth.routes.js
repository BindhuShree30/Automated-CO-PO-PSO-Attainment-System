/**
 * ------------------------------------------------------------------
 * Authentication Routes
 * ------------------------------------------------------------------
 */

import { Router } from "express";

import authController from "./auth.controller.js";
import validate from "../../middleware/validate.middleware.js";
import authMiddleware from "../../middleware/auth.middleware.js";

import {
  registerSchema,
  loginSchema,
} from "./auth.schema.js";

const router = Router();

/**
 * Register User
 */
router.post(
  "/register",
  validate(registerSchema),
  authController.register
);

/**
 * Login User
 */
router.post(
  "/login",
  validate(loginSchema),
  authController.login
);

/**
 * Get Logged-in User
 */
router.get(
  "/me",
  authMiddleware,
  authController.me
);

export default router;