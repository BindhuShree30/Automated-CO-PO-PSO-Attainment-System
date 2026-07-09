/**
 * ------------------------------------------------------------------
 * Main Routes
 * ------------------------------------------------------------------
 */

import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";

const router = Router();

/**
 * Health Check
 */
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running",
    data: null,
    error: null,
  });
});

/**
 * Authentication Routes
 */
router.use("/auth", authRoutes);

export default router;