/**
 * ------------------------------------------------------------------
 * Authentication Repository
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 * Handles all database operations related to users.
 * ------------------------------------------------------------------
 */

import User from "../../database/models/User.js";

/**
 * Find user by email
 */
const findUserByEmail = async (email) => {
  return await User.findOne({
    where: { email },
  });
};

/**
 * Find user by ID
 */
const findUserById = async (id) => {
  return await User.findByPk(id);
};

/**
 * Create new user
 */
const createUser = async (userData) => {
  return await User.create(userData);
};

/**
 * Update user
 */
const updateUser = async (id, userData) => {
  const user = await findUserById(id);

  if (!user) {
    return null;
  }

  return await user.update(userData);
};

export default {
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
};

