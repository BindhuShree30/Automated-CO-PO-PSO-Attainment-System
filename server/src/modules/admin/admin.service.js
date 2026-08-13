/**
 * ------------------------------------------------------------------
 * Admin Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import adminRepository from "./admin.repository.js";
import ApiError from "../../shared/errors/ApiError.js";

/**
 * ----------------------------------------------------------
 * Get Pending Users
 * ----------------------------------------------------------
 */
const getPendingUsers = async () => {
  return await adminRepository.findPendingUsers();
};

/**
 * ----------------------------------------------------------
 * Approve User
 * ----------------------------------------------------------
 */
const approveUser = async (id) => {
  const user = await adminRepository.findUserById(id);

  if (!user) {
    throw new ApiError(
      404,
      "User not found."
    );
  }

  if (user.status) {
    throw new ApiError(
      400,
      "User is already approved."
    );
  }

  return await adminRepository.approveUser(user);
};

/**
 * ----------------------------------------------------------
 * Reject User
 * ----------------------------------------------------------
 */
const rejectUser = async (id) => {
  const user = await adminRepository.findUserById(id);

  if (!user) {
    throw new ApiError(
      404,
      "User not found."
    );
  }

  if (user.status) {
    throw new ApiError(
      400,
      "Approved users cannot be rejected."
    );
  }

  await adminRepository.deleteUser(user);

  return null;
};

export default {
  getPendingUsers,
  approveUser,
  rejectUser,
};