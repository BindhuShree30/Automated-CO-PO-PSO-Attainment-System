/**
 * ------------------------------------------------------------------
 * Course Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Business logic for Course Management.
 *
 * Program is intentionally ignored at application level.
 * Existing program_id remains in the database only for compatibility.
 *
 * ------------------------------------------------------------------
 */

import courseRepository from "./course.repository.js";
import departmentRepository from "../department/department.repository.js";
import ApiError from "../../shared/errors/ApiError.js";

/**
 * ------------------------------------------------------------------
 * Create Course
 * ------------------------------------------------------------------
 */
const createCourse = async (courseData) => {
  const {
    code,
    departmentId,
  } = courseData;

  /**
   * Validate Department
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
   * Validate duplicate course code
   */
  const existingCourse =
    await courseRepository.findCourseByCode(code);

  if (existingCourse) {
    throw new ApiError(
      409,
      "Course code already exists."
    );
  }

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
const getCourseById = async (id) => {
  const course =
    await courseRepository.findCourseById(id);

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
const updateCourse = async (id, data) => {
  const course =
    await courseRepository.findCourseById(id);

  if (!course) {
    throw new ApiError(
      404,
      "Course not found."
    );
  }

  /**
   * Validate Department
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
   * Validate duplicate course code
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
const deleteCourse = async (id) => {
  const course =
    await courseRepository.findCourseById(id);

  if (!course) {
    throw new ApiError(
      404,
      "Course not found."
    );
  }

  await courseRepository.deleteCourse(course);

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