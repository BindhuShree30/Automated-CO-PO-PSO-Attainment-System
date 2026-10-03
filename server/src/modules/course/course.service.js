/**
 * ------------------------------------------------------------------
 * Course Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Business logic for Course Management.
 *
 * Course belongs to:
 *
 * Department
 * Program
 *
 * ------------------------------------------------------------------
 */

import courseRepository from "./course.repository.js";

import departmentRepository from "../department/department.repository.js";

import {
  Program,
} from "../../database/index.js";

import ApiError from "../../shared/errors/ApiError.js";

/**
 * ------------------------------------------------------------------
 * Validate Program
 * ------------------------------------------------------------------
 *
 * Ensures:
 *
 * 1. Program exists
 * 2. Program is active
 * 3. Program belongs to selected Department
 * ------------------------------------------------------------------
 */
const validateProgram = async (
  programId,
  departmentId
) => {
  const program =
    await Program.findByPk(
      programId
    );

  if (!program) {
    throw new ApiError(
      404,
      "Program not found."
    );
  }

  if (!program.status) {
    throw new ApiError(
      403,
      "Selected program is inactive."
    );
  }

  if (
    program.departmentId !==
    departmentId
  ) {
    throw new ApiError(
      400,
      "Selected program does not belong to the selected department."
    );
  }

  return program;
};

/**
 * ------------------------------------------------------------------
 * Create Course
 * ------------------------------------------------------------------
 */
const createCourse = async (
  courseData
) => {
  const {
    code,
    departmentId,
    programId,
  } = courseData;

  /**
   * --------------------------------------------------------------
   * Validate Department
   * --------------------------------------------------------------
   */
  const department =
    await departmentRepository.findDepartmentById(
      departmentId
    );

  if (!department) {
    throw new ApiError(
      404,
      "Department not found."
    );
  }

  /**
   * --------------------------------------------------------------
   * Validate Program
   * --------------------------------------------------------------
   */
  await validateProgram(
    programId,
    departmentId
  );

  /**
   * --------------------------------------------------------------
   * Validate Duplicate Course Code
   * --------------------------------------------------------------
   */
  const existingCourse =
    await courseRepository.findCourseByCode(
      code
    );

  if (existingCourse) {
    throw new ApiError(
      409,
      "Course code already exists."
    );
  }

  /**
   * --------------------------------------------------------------
   * Create Course
   * --------------------------------------------------------------
   */
  return await courseRepository.createCourse(
    courseData
  );
};

/**
 * ------------------------------------------------------------------
 * Get All Courses
 * ------------------------------------------------------------------
 */
const getCourses = async () => {
  return await courseRepository.findAllCourses();
};

/**
 * ------------------------------------------------------------------
 * Get Course By ID
 * ------------------------------------------------------------------
 */
const getCourseById = async (
  id
) => {
  const course =
    await courseRepository.findCourseById(
      id
    );

  if (!course) {
    throw new ApiError(
      404,
      "Course not found."
    );
  }

  return course;
};

/**
 * ------------------------------------------------------------------
 * Update Course
 * ------------------------------------------------------------------
 */
const updateCourse = async (
  id,
  data
) => {
  const course =
    await courseRepository.findCourseById(
      id
    );

  if (!course) {
    throw new ApiError(
      404,
      "Course not found."
    );
  }

  /**
   * --------------------------------------------------------------
   * Determine Final Department
   * --------------------------------------------------------------
   *
   * If department is being changed, use the new department.
   * Otherwise use the existing department.
   */
  const finalDepartmentId =
    data.departmentId ||
    course.departmentId;

  /**
   * --------------------------------------------------------------
   * Validate Department
   * --------------------------------------------------------------
   */
  if (data.departmentId) {
    const department =
      await departmentRepository.findDepartmentById(
        data.departmentId
      );

    if (!department) {
      throw new ApiError(
        404,
        "Department not found."
      );
    }
  }

  /**
   * --------------------------------------------------------------
   * Validate Program
   * --------------------------------------------------------------
   *
   * If either Department or Program changes,
   * validate their relationship.
   */
  if (
    data.programId ||
    data.departmentId
  ) {
    const finalProgramId =
      data.programId ||
      course.programId;

    await validateProgram(
      finalProgramId,
      finalDepartmentId
    );
  }

  /**
   * --------------------------------------------------------------
   * Validate Duplicate Course Code
   * --------------------------------------------------------------
   */
  if (data.code) {
    const existingCourse =
      await courseRepository.findCourseByCode(
        data.code
      );

    if (
      existingCourse &&
      existingCourse.id !== course.id
    ) {
      throw new ApiError(
        409,
        "Course code already exists."
      );
    }
  }

  /**
   * --------------------------------------------------------------
   * Update Course
   * --------------------------------------------------------------
   */
  return await courseRepository.updateCourse(
    course,
    data
  );
};

/**
 * ------------------------------------------------------------------
 * Delete Course
 * ------------------------------------------------------------------
 */
const deleteCourse = async (
  id
) => {
  const course =
    await courseRepository.findCourseById(
      id
    );

  if (!course) {
    throw new ApiError(
      404,
      "Course not found."
    );
  }

  await courseRepository.deleteCourse(
    course
  );

  return true;
};

/**
 * ------------------------------------------------------------------
 * Export
 * ------------------------------------------------------------------
 */
export default {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};