/**
 * ------------------------------------------------------------------
 * Course Outcome Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import coRepository from "./co.repository.js";
import courseRepository from "../course/course.repository.js";

import courseOfferingRepository from "../courseOffering/courseOffering.repository.js";

import Faculty from "../../database/models/Faculty.js";

import ApiError from "../../shared/errors/ApiError.js";

/**
 * ------------------------------------------------------------------
 * Check Whether Faculty Is Assigned To Course
 * ------------------------------------------------------------------
 *
 * Course assignment is determined from:
 *
 * course_offerings.faculty_id
 *
 * facultyId references:
 *
 * faculties.id
 * ------------------------------------------------------------------
 */
const verifyFacultyCourseAssignment = async (
  user,
  courseId
) => {
  if (!user) {
    throw new ApiError(
      401,
      "Authenticated user information is required."
    );
  }

  /**
   * --------------------------------------------------------------
   * Find Faculty
   * --------------------------------------------------------------
   *
   * The authenticated user contains the email from the JWT.
   *
   * Faculty records are maintained in the faculties table.
   */
  const faculty = await Faculty.findOne({
    where: {
      email: user.email,
    },
  });

  if (!faculty) {
    throw new ApiError(
      404,
      "Faculty profile not found."
    );
  }

  /**
   * --------------------------------------------------------------
   * Faculty Status
   * --------------------------------------------------------------
   */
  if (!faculty.status) {
    throw new ApiError(
      403,
      "Faculty account is not active."
    );
  }

  /**
   * --------------------------------------------------------------
   * Check Course Assignment
   * --------------------------------------------------------------
   */
  const assignment =
    await courseOfferingRepository
      .findCourseOfferingByFacultyAndCourse(
        faculty.id,
        courseId
      );

  if (!assignment) {
    throw new ApiError(
      403,
      "You are not assigned to this course."
    );
  }

  return {
    faculty,
    courseOffering: assignment,
  };
};

/**
 * ------------------------------------------------------------------
 * Create Course Outcome
 * ------------------------------------------------------------------
 */
const createCO = async (
  data,
  user
) => {
  /**
   * --------------------------------------------------------------
   * Validate Course
   * --------------------------------------------------------------
   */
  const course =
    await courseRepository.findById(
      data.courseId
    );

  if (!course) {
    throw new ApiError(
      404,
      "Course not found."
    );
  }

  /**
   * --------------------------------------------------------------
   * Faculty Assignment Validation
   * --------------------------------------------------------------
   *
   * This prevents a faculty member from creating COs
   * for another faculty member's course.
   */
  if (user?.role === "FACULTY") {
    await verifyFacultyCourseAssignment(
      user,
      data.courseId
    );
  }

  /**
   * --------------------------------------------------------------
   * Duplicate CO Number
   * --------------------------------------------------------------
   */
  const existingNumber =
    await coRepository.findByCourseAndNumber(
      data.courseId,
      data.coNumber
    );

  if (existingNumber) {
    throw new ApiError(
      409,
      "CO Number already exists for this course."
    );
  }

  /**
   * --------------------------------------------------------------
   * Duplicate CO Code
   * --------------------------------------------------------------
   */
  const existingCode =
    await coRepository.findByCourseAndCode(
      data.courseId,
      data.code
    );

  if (existingCode) {
    throw new ApiError(
      409,
      "CO Code already exists for this course."
    );
  }

  /**
   * --------------------------------------------------------------
   * Create
   * --------------------------------------------------------------
   */
  return await coRepository.create(
    data
  );
};

/**
 * ------------------------------------------------------------------
 * Get All Course Outcomes
 * ------------------------------------------------------------------
 */
const getCOs = async () => {
  return await coRepository.findAll();
};

/**
 * ------------------------------------------------------------------
 * Get Course Outcome By ID
 * ------------------------------------------------------------------
 */
const getCOById = async (id) => {
  const co =
    await coRepository.findById(id);

  if (!co) {
    throw new ApiError(
      404,
      "Course Outcome not found."
    );
  }

  return co;
};

/**
 * ------------------------------------------------------------------
 * Get Course Outcomes By Course
 * ------------------------------------------------------------------
 */
const getCOsByCourse = async (
  courseId,
  user
) => {
  /**
   * --------------------------------------------------------------
   * Validate Course
   * --------------------------------------------------------------
   */
  const course =
    await courseRepository.findById(
      courseId
    );

  if (!course) {
    throw new ApiError(
      404,
      "Course not found."
    );
  }

  /**
   * --------------------------------------------------------------
   * Faculty Assignment Validation
   * --------------------------------------------------------------
   */
  if (user?.role === "FACULTY") {
    await verifyFacultyCourseAssignment(
      user,
      courseId
    );
  }

  return await coRepository.findByCourseId(
    courseId
  );
};

/**
 * ------------------------------------------------------------------
 * Update Course Outcome
 * ------------------------------------------------------------------
 */
const updateCO = async (
  id,
  data,
  user
) => {
  const co =
    await coRepository.findById(id);

  if (!co) {
    throw new ApiError(
      404,
      "Course Outcome not found."
    );
  }

  /**
   * --------------------------------------------------------------
   * Faculty Assignment Validation
   * --------------------------------------------------------------
   *
   * Faculty can update only COs belonging to
   * courses assigned to them.
   */
  if (user?.role === "FACULTY") {
    await verifyFacultyCourseAssignment(
      user,
      co.courseId
    );

    /**
     * Prevent faculty from moving the CO
     * to another course.
     */
    if (
      data.courseId &&
      data.courseId !== co.courseId
    ) {
      throw new ApiError(
        403,
        "You cannot move a Course Outcome to another course."
      );
    }
  }

  /**
   * --------------------------------------------------------------
   * Duplicate CO Number
   * --------------------------------------------------------------
   */
  if (
    data.coNumber &&
    data.coNumber !== co.coNumber
  ) {
    const duplicate =
      await coRepository.findByCourseAndNumber(
        co.courseId,
        data.coNumber
      );

    if (
      duplicate &&
      duplicate.id !== id
    ) {
      throw new ApiError(
        409,
        "CO Number already exists for this course."
      );
    }
  }

  /**
   * --------------------------------------------------------------
   * Duplicate CO Code
   * --------------------------------------------------------------
   */
  if (
    data.code &&
    data.code !== co.code
  ) {
    const duplicate =
      await coRepository.findByCourseAndCode(
        co.courseId,
        data.code
      );

    if (
      duplicate &&
      duplicate.id !== id
    ) {
      throw new ApiError(
        409,
        "CO Code already exists for this course."
      );
    }
  }

  return await coRepository.update(
    co,
    data
  );
};

/**
 * ------------------------------------------------------------------
 * Delete Course Outcome
 * ------------------------------------------------------------------
 */
const deleteCO = async (
  id,
  user
) => {
  const co =
    await coRepository.findById(id);

  if (!co) {
    throw new ApiError(
      404,
      "Course Outcome not found."
    );
  }

  /**
   * --------------------------------------------------------------
   * Faculty Assignment Validation
   * --------------------------------------------------------------
   */
  if (user?.role === "FACULTY") {
    await verifyFacultyCourseAssignment(
      user,
      co.courseId
    );
  }

  await coRepository.remove(co);

  return {
    message:
      "Course Outcome deleted successfully.",
  };
};

export default {
  createCO,
  getCOs,
  getCOById,
  getCOsByCourse,
  updateCO,
  deleteCO,
};