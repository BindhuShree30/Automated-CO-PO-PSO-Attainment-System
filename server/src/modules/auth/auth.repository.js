/**
 * ---------------------------------------------------------
 * Authentication Repository
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ---------------------------------------------------------
 *
 * Handles database operations for authentication.
 *
 * Faculty registration creates:
 *
 * 1. User authentication record
 * 2. Academic Faculty record
 *
 * Both operations can participate in the same Sequelize
 * transaction.
 * ---------------------------------------------------------
 */

import User from "../../database/models/User.js";
import Faculty from "../../database/models/Faculty.js";

/**
 * ---------------------------------------------------------
 * Find User By Email
 * ---------------------------------------------------------
 */
const findUserByEmail = async (email) => {
  return await User.findOne({
    where: {
      email,
    },
  });
};

/**
 * ---------------------------------------------------------
 * Find User By ID
 * ---------------------------------------------------------
 */
const findUserById = async (id) => {
  return await User.findByPk(id);
};

/**
 * ---------------------------------------------------------
 * Create User
 * ---------------------------------------------------------
 *
 * transaction is optional.
 *
 * When supplied, User creation becomes part of the
 * registration transaction.
 * ---------------------------------------------------------
 */
const createUser = async (
  userData,
  transaction = null
) => {
  return await User.create(
    userData,
    transaction
      ? { transaction }
      : undefined
  );
};

/**
 * ---------------------------------------------------------
 * Find Faculty By Email
 * ---------------------------------------------------------
 */
const findFacultyByEmail = async (email) => {
  return await Faculty.findOne({
    where: {
      email,
    },
  });
};

/**
 * ---------------------------------------------------------
 * Find Faculty By Employee ID
 * ---------------------------------------------------------
 */
const findFacultyByEmployeeId = async (
  employeeId
) => {
  return await Faculty.findOne({
    where: {
      employeeId,
    },
  });
};

/**
 * ---------------------------------------------------------
 * Create Faculty
 * ---------------------------------------------------------
 *
 * transaction is optional.
 *
 * When supplied, Faculty creation becomes part of the
 * same transaction used for User creation.
 * ---------------------------------------------------------
 */
const createFaculty = async (
  facultyData,
  transaction = null
) => {
  return await Faculty.create(
    facultyData,
    transaction
      ? { transaction }
      : undefined
  );
};

/**
 * ---------------------------------------------------------
 * Export Repository
 * ---------------------------------------------------------
 */
export default {
  findUserByEmail,
  findUserById,
  createUser,
  findFacultyByEmail,
  findFacultyByEmployeeId,
  createFaculty,
};