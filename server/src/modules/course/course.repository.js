/**
 * ------------------------------------------------------------------
 * Course Repository
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Handles all database operations related to Courses.
 *
 * Course belongs to:
 *
 * - Department
 * - Program
 *
 * Program is required for:
 *
 * - Program Outcomes
 * - CO–PO Mapping
 * - CO–PSO Mapping
 * - Attainment Analysis
 *
 * ------------------------------------------------------------------
 */

import {
  Course,
  Department,
  Program,
} from "../../database/index.js";

/**
 * ------------------------------------------------------------------
 * Create Course
 * ------------------------------------------------------------------
 */
const createCourse = async (courseData) => {
  return await Course.create(courseData);
};

/**
 * ------------------------------------------------------------------
 * Find Course By ID
 * ------------------------------------------------------------------
 */
const findCourseById = async (id) => {
  return await Course.findByPk(id, {
    include: [
      {
        model: Department,
        as: "department",
        attributes: [
          "id",
          "code",
          "name",
        ],
      },

      {
        model: Program,
        as: "program",
        attributes: [
          "id",
          "code",
          "name",
          "departmentId",
          "status",
        ],
      },
    ],
  });
};

/**
 * ------------------------------------------------------------------
 * Generic Find By ID
 * ------------------------------------------------------------------
 */
const findById = async (id) => {
  return await findCourseById(id);
};

/**
 * ------------------------------------------------------------------
 * Find Course By Code
 * ------------------------------------------------------------------
 */
const findCourseByCode = async (code) => {
  return await Course.findOne({
    where: {
      code,
    },
  });
};

/**
 * ------------------------------------------------------------------
 * Get All Courses
 * ------------------------------------------------------------------
 */
const findAllCourses = async () => {
  return await Course.findAll({
    include: [
      {
        model: Department,
        as: "department",
        attributes: [
          "id",
          "code",
          "name",
        ],
      },

      {
        model: Program,
        as: "program",
        attributes: [
          "id",
          "code",
          "name",
          "departmentId",
          "status",
        ],
      },
    ],

    order: [
      ["code", "ASC"],
    ],
  });
};

/**
 * ------------------------------------------------------------------
 * Update Course
 * ------------------------------------------------------------------
 */
const updateCourse = async (
  course,
  data
) => {
  await course.update(data);

  return await findCourseById(
    course.id
  );
};

/**
 * ------------------------------------------------------------------
 * Delete Course
 * ------------------------------------------------------------------
 */
const deleteCourse = async (
  course
) => {
  return await course.destroy();
};

/**
 * ------------------------------------------------------------------
 * Export
 * ------------------------------------------------------------------
 */
export default {
  createCourse,
  findCourseById,
  findById,
  findCourseByCode,
  findAllCourses,
  updateCourse,
  deleteCourse,
};