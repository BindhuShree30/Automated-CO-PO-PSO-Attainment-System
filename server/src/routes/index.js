/**
 * ------------------------------------------------------------------
 * Main Routes
 * ------------------------------------------------------------------
 */

import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import departmentRoutes from "../modules/department/department.routes.js";
import programRoutes from "../modules/program/program.routes.js"; // <-- Add this

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

/**
 * Department Routes
 */
router.use("/departments", departmentRoutes);

/**
 * Program Routes
 */
router.use("/programs", programRoutes);

export default router;