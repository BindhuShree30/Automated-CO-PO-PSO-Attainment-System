/**
 * ------------------------------------------------------------------
 * Course Service
 * ------------------------------------------------------------------
 */

import courseRepository from "./course.repository.js";
import programRepository from "../program/program.repository.js";
import ApiError from "../../shared/errors/ApiError.js";

/**
 * Create Course
 */
const createCourse = async (courseData) => {
  const { code, programId } = courseData;

  // Check Program
  const program =
    await programRepository.findProgramById(programId);

  if (!program) {
    throw new ApiError(404, "Program not found");
  }

  // Check duplicate code
  const existingCourse =
    await courseRepository.findCourseByCode(code);

  if (existingCourse) {
    throw new ApiError(
      409,
      "Course code already exists"
    );
  }

  return await courseRepository.createCourse(courseData);
};

/**
 * Get All Courses
 */
const getCourses = async () => {
  return await courseRepository.findAllCourses();
};

/**
 * Get Course By ID
 */
const getCourseById = async (id) => {
  const course =
    await courseRepository.findCourseById(id);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  return course;
};

/**
 * Update Course
 */
const updateCourse = async (id, data) => {
  const course =
    await courseRepository.findCourseById(id);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  if (data.code) {
    const existing =
      await courseRepository.findCourseByCode(data.code);

    if (
      existing &&
      existing.id !== course.id
    ) {
      throw new ApiError(
        409,
        "Course code already exists"
      );
    }
  }

  return await courseRepository.updateCourse(
    course,
    data
  );
};

/**
 * Delete Course
 */
const deleteCourse = async (id) => {
  const course =
    await courseRepository.findCourseById(id);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  await courseRepository.deleteCourse(course);
};

export default {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};