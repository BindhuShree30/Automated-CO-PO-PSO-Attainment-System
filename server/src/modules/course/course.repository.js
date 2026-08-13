/**
 * ------------------------------------------------------------------
 * Course Repository
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Handles all database operations related to Courses.
 *
 * Program is retained only for backward compatibility.
 * Department is the active relationship used by the application.
 *
 * ------------------------------------------------------------------
 */

import {
  Course,
  Department,
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
const updateCourse = async (course, data) => {
  await course.update(data);

  return await findCourseById(course.id);
};

/**
 * ------------------------------------------------------------------
 * Delete Course
 * ------------------------------------------------------------------
 */
const deleteCourse = async (course) => {
  return await course.destroy();
};

export default {
  createCourse,
  findCourseById,
  findById,
  findCourseByCode,
  findAllCourses,
  updateCourse,
  deleteCourse,
};