/**
 * ---------------------------------------------------------
 * Authentication Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ---------------------------------------------------------
 *
 * Handles authentication business logic.
 *
 * Faculty registration creates TWO records:
 *
 * 1. users
 * 2. faculties
 *
 * users:
 *   role   = FACULTY
 *   status = PENDING
 *
 * faculties:
 *   status = false
 *
 * HOD approval synchronizes both records:
 *
 * users.status     = APPROVED
 * faculties.status = true
 *
 * HOD rejection synchronizes both records:
 *
 * users.status     = REJECTED
 * faculties.status = false
 * ---------------------------------------------------------
 */

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import env from "../../config/env.config.js";
import authRepository from "./auth.repository.js";

import ROLES from "../../shared/constants/roles.js";
import ApiError from "../../shared/errors/ApiError.js";

import sequelize from "../../database/connection.js";

/**
 * ---------------------------------------------------------
 * Register Faculty
 * ---------------------------------------------------------
 *
 * Public registration is ONLY for Faculty.
 *
 * The client cannot choose the role.
 *
 * Automatically creates:
 *
 * users:
 *   role   = FACULTY
 *   status = PENDING
 *
 * faculties:
 *   status = false
 *
 * Both records are created inside the same transaction.
 * ---------------------------------------------------------
 */
const registerUser = async (userData) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    employeeId,
    designation,
    departmentId,
    password,
  } = userData;

  /**
   * -------------------------------------------------------
   * Normalize Values
   * -------------------------------------------------------
   */
  const normalizedEmail =
    email.trim().toLowerCase();

  const normalizedEmployeeId =
    employeeId.trim().toUpperCase();

  /**
   * -------------------------------------------------------
   * Check User Email
   * -------------------------------------------------------
   */
  const existingUser =
    await authRepository.findUserByEmail(
      normalizedEmail
    );

  if (existingUser) {
    throw new ApiError(
      409,
      "Email already exists."
    );
  }

  /**
   * -------------------------------------------------------
   * Check Faculty Email
   * -------------------------------------------------------
   */
  const existingFaculty =
    await authRepository.findFacultyByEmail(
      normalizedEmail
    );

  if (existingFaculty) {
    throw new ApiError(
      409,
      "Faculty with this email already exists."
    );
  }

  /**
   * -------------------------------------------------------
   * Check Employee ID
   * -------------------------------------------------------
   */
  const existingEmployee =
    await authRepository.findFacultyByEmployeeId(
      normalizedEmployeeId
    );

  if (existingEmployee) {
    throw new ApiError(
      409,
      "Employee ID already exists."
    );
  }

  /**
   * -------------------------------------------------------
   * Hash Password
   * -------------------------------------------------------
   */
  const hashedPassword =
    await bcrypt.hash(
      password,
      10
    );

  /**
   * -------------------------------------------------------
   * Start Transaction
   * -------------------------------------------------------
   *
   * User and Faculty must either BOTH be created
   * or NEITHER should be created.
   */
  const transaction =
    await sequelize.transaction();

  try {
    /**
     * -----------------------------------------------------
     * Create User Authentication Account
     * -----------------------------------------------------
     */
    const user =
      await authRepository.createUser(
        {
          firstName,
          lastName,
          email: normalizedEmail,
          password: hashedPassword,
          role: ROLES.FACULTY,
          status: "PENDING",
        },
        transaction
      );

    /**
     * -----------------------------------------------------
     * Create Academic Faculty Profile
     * -----------------------------------------------------
     *
     * This record will be used by:
     *
     * - HOD Faculty Management
     * - Course Offerings
     * - Faculty Assignment
     * - Faculty dropdown
     *
     * New Faculty is inactive until HOD approval.
     */
    await authRepository.createFaculty(
      {
        firstName,
        lastName,
        email: normalizedEmail,
        phone,
        employeeId:
          normalizedEmployeeId,
        designation,
        departmentId,
        status: false,
      },
      transaction
    );

    /**
     * -----------------------------------------------------
     * Commit Transaction
     * -----------------------------------------------------
     */
    await transaction.commit();

    /**
     * -----------------------------------------------------
     * Return Safe User Data
     * -----------------------------------------------------
     *
     * Password is never returned.
     */
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    };
  } catch (error) {
    /**
     * -----------------------------------------------------
     * Rollback
     * -----------------------------------------------------
     */
    await transaction.rollback();

    throw error;
  }
};

/**
 * ---------------------------------------------------------
 * Login User
 * ---------------------------------------------------------
 *
 * Supports:
 *
 * - HOD
 * - FACULTY
 *
 * Faculty must be APPROVED before login.
 * ---------------------------------------------------------
 */
const loginUser = async ({
  email,
  password,
  selectedRole,
}) => {
  /**
   * -------------------------------------------------------
   * Normalize Email
   * -------------------------------------------------------
   */
  const normalizedEmail =
    email.trim().toLowerCase();

  /**
   * -------------------------------------------------------
   * Find User
   * -------------------------------------------------------
   */
  const user =
    await authRepository.findUserByEmail(
      normalizedEmail
    );

  if (!user) {
    throw new ApiError(
      401,
      "Invalid email or password."
    );
  }

  /**
   * -------------------------------------------------------
   * Validate Role
   * -------------------------------------------------------
   */
  if (
    !Object.values(ROLES).includes(
      user.role
    )
  ) {
    throw new ApiError(
      403,
      "Invalid account role."
    );
  }

  /**
   * -------------------------------------------------------
   * Validate Selected Role
   * -------------------------------------------------------
   */
  if (
    selectedRole &&
    selectedRole !== user.role
  ) {
    throw new ApiError(
      403,
      "Selected role does not match this account."
    );
  }

  /**
   * -------------------------------------------------------
   * HOD Status
   * -------------------------------------------------------
   *
   * HOD accounts must also be approved.
   * -------------------------------------------------------
   */
  if (user.status === "PENDING") {
    throw new ApiError(
      403,
      "Your account is waiting for approval."
    );
  }

  if (user.status === "REJECTED") {
    throw new ApiError(
      403,
      "Your account has been rejected by the HOD."
    );
  }

  if (user.status !== "APPROVED") {
    throw new ApiError(
      403,
      "Your account is not approved for login."
    );
  }

  /**
   * -------------------------------------------------------
   * Verify Password
   * -------------------------------------------------------
   */
  const isPasswordValid =
    await bcrypt.compare(
      password,
      user.password
    );

  if (!isPasswordValid) {
    throw new ApiError(
      401,
      "Invalid email or password."
    );
  }

  /**
   * -------------------------------------------------------
   * Generate JWT
   * -------------------------------------------------------
   */
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    env.jwt.secret,
    {
      expiresIn:
        env.jwt.expiresIn,
    }
  );

  /**
   * -------------------------------------------------------
   * Return Authentication Result
   * -------------------------------------------------------
   */
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
 * ---------------------------------------------------------
 * Get Current Logged-in User
 * ---------------------------------------------------------
 */
const getCurrentUser = async (
  userId
) => {
  const user =
    await authRepository.findUserById(
      userId
    );

  if (!user) {
    throw new ApiError(
      404,
      "User not found."
    );
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

/**
 * ---------------------------------------------------------
 * Export Authentication Service
 * ---------------------------------------------------------
 */
export default {
  registerUser,
  loginUser,
  getCurrentUser,
};