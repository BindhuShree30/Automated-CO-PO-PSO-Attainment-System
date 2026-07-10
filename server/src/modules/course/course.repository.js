/**
 * ------------------------------------------------------------------
 * Course Repository
 * ------------------------------------------------------------------
 */

import Course from "../../database/models/Course.js";

const createCourse = async (courseData) => {
  return await Course.create(courseData);
};

const findCourseById = async (id) => {
  return await Course.findByPk(id);
};

const findCourseByCode = async (code) => {
  return await Course.findOne({
    where: { code },
  });
};

const findAllCourses = async () => {
  return await Course.findAll();
};

const updateCourse = async (course, data) => {
  return await course.update(data);
};

const deleteCourse = async (course) => {
  return await course.destroy();
};

export default {
  createCourse,
  findCourseById,
  findCourseByCode,
  findAllCourses,
  updateCourse,
  deleteCourse,
};