/**
 * ---------------------------------------------------------
 * HOD Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ---------------------------------------------------------
 *
 * Handles HOD business logic.
 *
 * Current scope:
 * - Faculty approval
 * - Faculty rejection
 * - Faculty status changes
 *
 * IMPORTANT:
 *
 * The system maintains two faculty-related records:
 *
 * 1. users
 *    - Authentication account
 *    - Stores login credentials
 *    - Stores role
 *    - Stores approval status
 *
 * 2. faculties
 *    - Academic faculty profile
 *    - Used by Course Offerings
 *    - Stores employee ID, designation,
 *      department, etc.
 *
 * Both records are synchronized using faculty email.
 *
 * User status:
 *    PENDING
 *    APPROVED
 *    REJECTED
 *
 * Academic Faculty status:
 *    true  = active
 *    false = inactive
 * ---------------------------------------------------------
 */

import hodRepository from "./hod.repository.js";

import Faculty from "../../database/models/Faculty.js";
import sequelize from "../../database/connection.js";

import ApiError from "../../shared/errors/ApiError.js";

/**
 * ---------------------------------------------------------
 * Get Pending Faculty
 * ---------------------------------------------------------
 *
 * Returns Faculty login accounts that are waiting
 * for HOD approval.
 * ---------------------------------------------------------
 */
const getPendingFaculty = async () => {
  return await hodRepository.findPendingFaculty();
};

/**
 * ---------------------------------------------------------
 * Get All Faculty
 * ---------------------------------------------------------
 *
 * Returns all Faculty login accounts.
 * ---------------------------------------------------------
 */
const getAllFaculty = async () => {
  return await hodRepository.findAllFaculty();
};

/**
 * ---------------------------------------------------------
 * Get Faculty By ID
 * ---------------------------------------------------------
 *
 * ID here refers to the User ID because the HOD faculty
 * approval workflow operates on the users table.
 * ---------------------------------------------------------
 */
const getFacultyById = async (facultyId) => {
  const faculty =
    await hodRepository.findFacultyById(facultyId);

  if (!faculty) {
    throw new ApiError(
      404,
      "Faculty not found."
    );
  }

  return faculty;
};

/**
 * ---------------------------------------------------------
 * Find Academic Faculty Profile
 * ---------------------------------------------------------
 *
 * Finds the corresponding record from the faculties table.
 *
 * The relationship between:
 *
 * users
 *   ↓
 * faculties
 *
 * is currently established using the faculty email.
 *
 * This is important because the User ID and Faculty ID
 * are different UUIDs.
 * ---------------------------------------------------------
 */
const findAcademicFaculty = async (
  email,
  transaction
) => {
  return await Faculty.findOne({
    where: {
      email,
    },
    transaction,
  });
};

/**
 * ---------------------------------------------------------
 * Approve Faculty
 * ---------------------------------------------------------
 *
 * Workflow:
 *
 * PENDING
 *    ↓
 * APPROVED
 *
 * Updates:
 *
 * users.status     = APPROVED
 * faculties.status = true
 *
 * This ensures that an approved Faculty:
 *
 * 1. Can log into the application.
 * 2. Appears as an active academic Faculty.
 * 3. Can be selected for Course Offerings.
 *
 * ---------------------------------------------------------
 */
const approveFaculty = async (facultyId) => {
  /**
   * -------------------------------------------------------
   * Find User Faculty
   * -------------------------------------------------------
   */
  const faculty =
    await hodRepository.findFacultyById(
      facultyId
    );

  if (!faculty) {
    throw new ApiError(
      404,
      "Faculty not found."
    );
  }

  /**
   * -------------------------------------------------------
   * Validate Role
   * -------------------------------------------------------
   */
  if (faculty.role !== "FACULTY") {
    throw new ApiError(
      400,
      "Only Faculty accounts can be approved."
    );
  }

  /**
   * -------------------------------------------------------
   * Already Approved
   * -------------------------------------------------------
   */
  if (faculty.status === "APPROVED") {
    throw new ApiError(
      409,
      "Faculty is already approved."
    );
  }

  /**
   * -------------------------------------------------------
   * Start Transaction
   * -------------------------------------------------------
   */
  const transaction =
    await sequelize.transaction();

  try {
    /**
     * -----------------------------------------------------
     * Find Academic Faculty Profile
     * -----------------------------------------------------
     *
     * This record must already exist in faculties.
     *
     * New Faculty registrations should create this
     * academic profile automatically.
     * -----------------------------------------------------
     */
    const academicFaculty =
      await findAcademicFaculty(
        faculty.email,
        transaction
      );

    if (!academicFaculty) {
      throw new ApiError(
        404,
        "Academic faculty profile not found. Faculty registration data is incomplete."
      );
    }

    /**
     * -----------------------------------------------------
     * Update User Account
     * -----------------------------------------------------
     */
    await faculty.update(
      {
        status: "APPROVED",
      },
      {
        transaction,
      }
    );

    /**
     * -----------------------------------------------------
     * Activate Academic Faculty
     * -----------------------------------------------------
     */
    await academicFaculty.update(
      {
        status: true,
      },
      {
        transaction,
      }
    );

    /**
     * -----------------------------------------------------
     * Commit Transaction
     * -----------------------------------------------------
     */
    await transaction.commit();

    /**
     * -----------------------------------------------------
     * Return Updated User
     * -----------------------------------------------------
     */
    return {
      id: faculty.id,
      firstName: faculty.firstName,
      lastName: faculty.lastName,
      email: faculty.email,
      role: faculty.role,
      status: faculty.status,
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
 * Reject Faculty
 * ---------------------------------------------------------
 *
 * Workflow:
 *
 * PENDING
 *    ↓
 * REJECTED
 *
 * Updates:
 *
 * users.status     = REJECTED
 * faculties.status = false
 *
 * The Faculty account remains in the database but cannot
 * log into the application.
 * ---------------------------------------------------------
 */
const rejectFaculty = async (facultyId) => {
  /**
   * -------------------------------------------------------
   * Find User Faculty
   * -------------------------------------------------------
   */
  const faculty =
    await hodRepository.findFacultyById(
      facultyId
    );

  if (!faculty) {
    throw new ApiError(
      404,
      "Faculty not found."
    );
  }

  /**
   * -------------------------------------------------------
   * Validate Role
   * -------------------------------------------------------
   */
  if (faculty.role !== "FACULTY") {
    throw new ApiError(
      400,
      "Only Faculty accounts can be rejected."
    );
  }

  /**
   * -------------------------------------------------------
   * Already Rejected
   * -------------------------------------------------------
   */
  if (faculty.status === "REJECTED") {
    throw new ApiError(
      409,
      "Faculty is already rejected."
    );
  }

  /**
   * -------------------------------------------------------
   * Start Transaction
   * -------------------------------------------------------
   */
  const transaction =
    await sequelize.transaction();

  try {
    /**
     * -----------------------------------------------------
     * Find Academic Faculty
     * -----------------------------------------------------
     */
    const academicFaculty =
      await findAcademicFaculty(
        faculty.email,
        transaction
      );

    /**
     * -----------------------------------------------------
     * Update User
     * -----------------------------------------------------
     */
    await faculty.update(
      {
        status: "REJECTED",
      },
      {
        transaction,
      }
    );

    /**
     * -----------------------------------------------------
     * Deactivate Academic Faculty
     * -----------------------------------------------------
     */
    if (academicFaculty) {
      await academicFaculty.update(
        {
          status: false,
        },
        {
          transaction,
        }
      );
    }

    /**
     * -----------------------------------------------------
     * Commit
     * -----------------------------------------------------
     */
    await transaction.commit();

    /**
     * -----------------------------------------------------
     * Return Updated User
     * -----------------------------------------------------
     */
    return {
      id: faculty.id,
      firstName: faculty.firstName,
      lastName: faculty.lastName,
      email: faculty.email,
      role: faculty.role,
      status: faculty.status,
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
 * Change Faculty Status
 * ---------------------------------------------------------
 *
 * Allowed transitions:
 *
 * PENDING   → APPROVED
 * PENDING   → REJECTED
 *
 * APPROVED  → REJECTED
 * APPROVED  → APPROVED
 *
 * REJECTED  → APPROVED
 * REJECTED  → REJECTED
 *
 * Synchronization:
 *
 * User status:
 *    PENDING / APPROVED / REJECTED
 *
 * Academic Faculty status:
 *    APPROVED → true
 *    Everything else → false
 *
 * ---------------------------------------------------------
 */
const changeFacultyStatus = async (
  facultyId,
  status
) => {
  /**
   * -------------------------------------------------------
   * Allowed Statuses
   * -------------------------------------------------------
   */
  const allowedStatuses = [
    "PENDING",
    "APPROVED",
    "REJECTED",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new ApiError(
      400,
      "Invalid faculty status. Allowed values are PENDING, APPROVED and REJECTED."
    );
  }

  /**
   * -------------------------------------------------------
   * Find Faculty User
   * -------------------------------------------------------
   */
  const faculty =
    await hodRepository.findFacultyById(
      facultyId
    );

  if (!faculty) {
    throw new ApiError(
      404,
      "Faculty not found."
    );
  }

  /**
   * -------------------------------------------------------
   * Validate Role
   * -------------------------------------------------------
   */
  if (faculty.role !== "FACULTY") {
    throw new ApiError(
      400,
      "Only Faculty accounts can have their status changed."
    );
  }

  /**
   * -------------------------------------------------------
   * Same Status
   * -------------------------------------------------------
   */
  if (faculty.status === status) {
    throw new ApiError(
      409,
      `Faculty is already ${status.toLowerCase()}.`
    );
  }

  /**
   * -------------------------------------------------------
   * Start Transaction
   * -------------------------------------------------------
   */
  const transaction =
    await sequelize.transaction();

  try {
    /**
     * -----------------------------------------------------
     * Find Academic Faculty
     * -----------------------------------------------------
     */
    const academicFaculty =
      await findAcademicFaculty(
        faculty.email,
        transaction
      );

    /**
     * -----------------------------------------------------
     * Update User Status
     * -----------------------------------------------------
     */
    await faculty.update(
      {
        status,
      },
      {
        transaction,
      }
    );

    /**
     * -----------------------------------------------------
     * Synchronize Academic Faculty
     * -----------------------------------------------------
     *
     * Only APPROVED Faculty should be active and available
     * for Course Offering assignment.
     * -----------------------------------------------------
     */
    if (academicFaculty) {
      await academicFaculty.update(
        {
          status: status === "APPROVED",
        },
        {
          transaction,
        }
      );
    }

    /**
     * -----------------------------------------------------
     * Commit
     * -----------------------------------------------------
     */
    await transaction.commit();

    /**
     * -----------------------------------------------------
     * Return Updated User
     * -----------------------------------------------------
     */
    return {
      id: faculty.id,
      firstName: faculty.firstName,
      lastName: faculty.lastName,
      email: faculty.email,
      role: faculty.role,
      status: faculty.status,
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
 * Export HOD Service
 * ---------------------------------------------------------
 */
export default {
  getPendingFaculty,
  getAllFaculty,
  getFacultyById,
  approveFaculty,
  rejectFaculty,
  changeFacultyStatus,
};