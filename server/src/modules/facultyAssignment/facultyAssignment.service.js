/**
 * ------------------------------------------------------------------
 * Faculty Assignment Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import facultyAssignmentRepository from "./facultyAssignment.repository.js";

import Faculty from "../../database/models/Faculty.js";
import CourseOffering from "../../database/models/CourseOffering.js";

import ApiError from "../../shared/errors/ApiError.js";

/**
 * ------------------------------------------------------------------
 * Create Faculty Assignment
 * ------------------------------------------------------------------
 */

const createAssignment = async (data) => {
  const {
    facultyId,
    courseOfferingId,
  } = data;

  /**
   * --------------------------------------------------------------
   * Check Faculty
   * --------------------------------------------------------------
   */

  const faculty =
    await Faculty.findByPk(
      facultyId
    );

  if (!faculty) {
    throw new ApiError(
      404,
      "Faculty not found."
    );
  }

  /**
   * --------------------------------------------------------------
   * Check Course Offering
   * --------------------------------------------------------------
   */

  const courseOffering =
    await CourseOffering.findByPk(
      courseOfferingId
    );

  if (!courseOffering) {
    throw new ApiError(
      404,
      "Course Offering not found."
    );
  }

  /**
   * --------------------------------------------------------------
   * Check Existing Assignment
   * --------------------------------------------------------------
   */

  const existing =
    await facultyAssignmentRepository.findByCourseOfferingId(
      courseOfferingId
    );

  if (existing) {
    throw new ApiError(
      409,
      "This Course Offering is already assigned to a Faculty."
    );
  }

  /**
   * --------------------------------------------------------------
   * Create
   * --------------------------------------------------------------
   */

  const assignment =
    await facultyAssignmentRepository.create(
      data
    );

  return await facultyAssignmentRepository.findById(
    assignment.id
  );
};

/**
 * ------------------------------------------------------------------
 * Get All Assignments
 * ------------------------------------------------------------------
 */

const getAllAssignments = async () => {
  return await facultyAssignmentRepository.findAll();
};

/**
 * ------------------------------------------------------------------
 * Get Assignment By ID
 * ------------------------------------------------------------------
 */

const getAssignmentById = async (
  id
) => {
  const assignment =
    await facultyAssignmentRepository.findById(
      id
    );

  if (!assignment) {
    throw new ApiError(
      404,
      "Faculty Assignment not found."
    );
  }

  return assignment;
};

/**
 * ------------------------------------------------------------------
 * Get My Courses
 * ------------------------------------------------------------------
 *
 * userId comes from authenticated user.
 * Faculty record is resolved using userId.
 * ------------------------------------------------------------------
 */

const getMyCourses = async (
  userId
) => {
  const faculty =
    await Faculty.findOne({
      where: {
        userId,
      },
    });

  if (!faculty) {
    throw new ApiError(
      404,
      "Faculty profile not found for the logged-in user."
    );
  }

  return await facultyAssignmentRepository.findByFacultyId(
    faculty.id
  );
};

/**
 * ------------------------------------------------------------------
 * Update Assignment
 * ------------------------------------------------------------------
 */

const updateAssignment = async (
  id,
  data
) => {
  const assignment =
    await facultyAssignmentRepository.findById(
      id
    );

  if (!assignment) {
    throw new ApiError(
      404,
      "Faculty Assignment not found."
    );
  }

  /**
   * --------------------------------------------------------------
   * Resolve new values
   * --------------------------------------------------------------
   */

  const facultyId =
    data.facultyId ??
    assignment.facultyId;

  const courseOfferingId =
    data.courseOfferingId ??
    assignment.courseOfferingId;

  /**
   * --------------------------------------------------------------
   * Validate Faculty
   * --------------------------------------------------------------
   */

  const faculty =
    await Faculty.findByPk(
      facultyId
    );

  if (!faculty) {
    throw new ApiError(
      404,
      "Faculty not found."
    );
  }

  /**
   * --------------------------------------------------------------
   * Validate Course Offering
   * --------------------------------------------------------------
   */

  const courseOffering =
    await CourseOffering.findByPk(
      courseOfferingId
    );

  if (!courseOffering) {
    throw new ApiError(
      404,
      "Course Offering not found."
    );
  }

  /**
   * --------------------------------------------------------------
   * Check Duplicate
   * --------------------------------------------------------------
   */

  const existing =
    await facultyAssignmentRepository.findExisting(
      facultyId,
      courseOfferingId
    );

  if (
    existing &&
    existing.id !== id
  ) {
    throw new ApiError(
      409,
      "This Faculty Assignment already exists."
    );
  }

  /**
   * --------------------------------------------------------------
   * Update
   * --------------------------------------------------------------
   */

  await facultyAssignmentRepository.update(
    assignment,
    {
      ...data,
      facultyId,
      courseOfferingId,
    }
  );

  return await facultyAssignmentRepository.findById(
    id
  );
};

/**
 * ------------------------------------------------------------------
 * Delete Assignment
 * ------------------------------------------------------------------
 */

const deleteAssignment = async (
  id
) => {
  const assignment =
    await facultyAssignmentRepository.findById(
      id
    );

  if (!assignment) {
    throw new ApiError(
      404,
      "Faculty Assignment not found."
    );
  }

  await facultyAssignmentRepository.remove(
    assignment
  );

  return true;
};

export default {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
  getMyCourses,
  updateAssignment,
  deleteAssignment,
};