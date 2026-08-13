/**
 * ------------------------------------------------------------------
 * Admin Repository
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import User from "../../database/models/User.js";

/**
 * Get All Pending Users
 */
const findPendingUsers = async () => {
  return await User.findAll({
    where: {
      status: false,
    },
    attributes: {
      exclude: ["password"],
    },
    order: [["createdAt", "DESC"]],
  });
};

/**
 * Find User By ID
 */
const findUserById = async (id) => {
  return await User.findByPk(id);
};

/**
 * Approve User
 */
const approveUser = async (user) => {
  return await user.update({
    status: true,
  });
};

/**
 * Delete User
 */
const deleteUser = async (user) => {
  await user.destroy();

  return true;
};

export default {
  findPendingUsers,
  findUserById,
  approveUser,
  deleteUser,
};