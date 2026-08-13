/**
 * ------------------------------------------------------------------
 * Admin Controller
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import adminService from "./admin.service.js";
import asyncHandler from "../../shared/helpers/asyncHandler.js";
import { successResponse } from "../../shared/helpers/apiResponse.js";

/**
 * ----------------------------------------------------------
 * Get Pending Users
 * ----------------------------------------------------------
 */
const getPendingUsers = asyncHandler(
  async (req, res) => {
    const users =
      await adminService.getPendingUsers();

    return successResponse(
      res,
      "Pending users fetched successfully.",
      users
    );
  }
);

/**
 * ----------------------------------------------------------
 * Approve User
 * ----------------------------------------------------------
 */
const approveUser = asyncHandler(
  async (req, res) => {
    const user =
      await adminService.approveUser(
        req.validatedData.params.id
      );

    return successResponse(
      res,
      "User approved successfully.",
      user
    );
  }
);

/**
 * ----------------------------------------------------------
 * Reject User
 * ----------------------------------------------------------
 */
const rejectUser = asyncHandler(
  async (req, res) => {
    await adminService.rejectUser(
      req.validatedData.params.id
    );

    return successResponse(
      res,
      "User rejected successfully.",
      null
    );
  }
);

export default {
  getPendingUsers,
  approveUser,
  rejectUser,
};