/**
 * ------------------------------------------------------------------
 * Faculty Repository
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Handles database operations related to academic faculty.
 *
 * IMPORTANT DATABASE DESIGN:
 *
 * Authentication account:
 *
 *     users
 *
 * Academic faculty profile:
 *
 *     faculties
 *
 * Course Offering:
 *
 *     course_offerings.faculty_id
 *              ↓
 *          faculties.id
 *
 * Therefore Course Offering MUST receive:
 *
 *     faculties.id
 *
 * and NEVER:
 *
 *     users.id
 * ------------------------------------------------------------------
 */

import { Op } from "sequelize";

import Faculty from "../../database/models/Faculty.js";
import User from "../../database/models/User.js";

/**
 * ------------------------------------------------------------------
 * Get All Faculty
 * ------------------------------------------------------------------
 *
 * Returns academic faculty records from the `faculties` table.
 *
 * The returned `id` is always `faculties.id`.
 * ------------------------------------------------------------------
 */
const findAllFaculty = async () => {
  return await Faculty.findAll({
    order: [
      ["firstName", "ASC"],
      ["lastName", "ASC"],
    ],
  });
};

/**
 * ------------------------------------------------------------------
 * Get Approved Faculty
 * ------------------------------------------------------------------
 *
 * Used by:
 *
 *     GET /api/v1/faculty/approved
 *
 * Approval is represented in TWO places:
 *
 * users:
 *     role   = FACULTY
 *     status = APPROVED
 *
 * faculties:
 *     status = true
 *
 * We first find approved Faculty login accounts from `users`.
 *
 * Then we find their academic faculty profiles from `faculties`.
 *
 * This guarantees that the ID returned to the frontend is:
 *
 *     faculties.id
 *
 * which is the correct foreign-key value for:
 *
 *     course_offerings.faculty_id
 * ------------------------------------------------------------------
 */
const findApprovedFaculty = async () => {
  /**
   * ---------------------------------------------------------------
   * Find approved Faculty login accounts
   * ---------------------------------------------------------------
   */
  const approvedUsers = await User.findAll({
    where: {
      role: "FACULTY",
      status: "APPROVED",
    },

    attributes: [
      "id",
      "firstName",
      "lastName",
      "email",
    ],
  });

  /**
   * ---------------------------------------------------------------
   * No approved users
   * ---------------------------------------------------------------
   */
  if (!approvedUsers.length) {
    return [];
  }

  /**
   * ---------------------------------------------------------------
   * Extract approved Faculty emails
   * ---------------------------------------------------------------
   *
   * The current database links User and Faculty through email.
   *
   * Example:
   *
   * users.email
   *     =
   * faculties.email
   * ---------------------------------------------------------------
   */
  const approvedEmails =
    approvedUsers.map(
      (user) => user.email
    );

  /**
   * ---------------------------------------------------------------
   * Find academic Faculty profiles
   * ---------------------------------------------------------------
   *
   * IMPORTANT:
   *
   * The returned ID here is:
   *
   *     Faculty.id
   *
   * NOT:
   *
   *     User.id
   * ---------------------------------------------------------------
   */
  const faculties =
    await Faculty.findAll({
      where: {
        status: true,

        email: {
          [Op.in]: approvedEmails,
        },
      },

      order: [
        ["firstName", "ASC"],
        ["lastName", "ASC"],
      ],
    });

  /**
   * ---------------------------------------------------------------
   * Return academic faculty records
   * ---------------------------------------------------------------
   */
  return faculties;
};

/**
 * ------------------------------------------------------------------
 * Get Faculty By ID
 * ------------------------------------------------------------------
 *
 * IMPORTANT:
 *
 * The ID must be a `faculties.id`.
 * ------------------------------------------------------------------
 */
const findFacultyById = async (
  facultyId
) => {
  return await Faculty.findByPk(
    facultyId
  );
};

/**
 * ------------------------------------------------------------------
 * Get Faculty By Email
 * ------------------------------------------------------------------
 */
const findFacultyByEmail = async (
  email
) => {
  return await Faculty.findOne({
    where: {
      email,
    },
  });
};

/**
 * ------------------------------------------------------------------
 * Get Faculty By Employee ID
 * ------------------------------------------------------------------
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
 * ------------------------------------------------------------------
 * Export Repository
 * ------------------------------------------------------------------
 */
export default {
  findAllFaculty,
  findApprovedFaculty,
  findFacultyById,
  findFacultyByEmail,
  findFacultyByEmployeeId,
};