/**
 * ------------------------------------------------------------------
 * Course Offering Repository
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import CourseOffering from "../../database/models/CourseOffering.js";
import Course from "../../database/models/Course.js";
import Batch from "../../database/models/Batch.js";
import Semester from "../../database/models/Semester.js";
import Faculty from "../../database/models/Faculty.js";

/**
 * ------------------------------------------------------------------
 * Get All Course Offerings
 * ------------------------------------------------------------------
 */
const findAllCourseOfferings = async () => {
  return await CourseOffering.findAll({
    include: [
      {
        model: Course,
        as: "course",
      },
      {
        model: Batch,
        as: "batch",
      },
      {
        model: Semester,
        as: "semester",
      },
      {
        model: Faculty,
        as: "faculty",
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

/**
 * ------------------------------------------------------------------
 * Get Course Offering By ID
 * ------------------------------------------------------------------
 */
const findCourseOfferingById = async (id) => {
  return await CourseOffering.findByPk(id, {
    include: [
      {
        model: Course,
        as: "course",
      },
      {
        model: Batch,
        as: "batch",
      },
      {
        model: Semester,
        as: "semester",
      },
      {
        model: Faculty,
        as: "faculty",
      },
    ],
  });
};

/**
 * ------------------------------------------------------------------
 * Find Course
 * ------------------------------------------------------------------
 */
const findCourseById = async (courseId) => {
  return await Course.findByPk(courseId);
};

/**
 * ------------------------------------------------------------------
 * Find Batch
 * ------------------------------------------------------------------
 */
const findBatchById = async (batchId) => {
  return await Batch.findByPk(batchId);
};

/**
 * ------------------------------------------------------------------
 * Find Semester
 * ------------------------------------------------------------------
 */
const findSemesterById = async (semesterId) => {
  return await Semester.findByPk(semesterId);
};

/**
 * ------------------------------------------------------------------
 * IMPORTANT:
 *
 * Find Faculty From `faculties` Table
 *
 * DO NOT use User.findByPk()
 *
 * course_offerings.faculty_id references:
 *
 * faculties.id
 * ------------------------------------------------------------------
 */
const findFacultyById = async (facultyId) => {
  return await Faculty.findByPk(facultyId);
};

/**
 * ------------------------------------------------------------------
 * Create Course Offering
 * ------------------------------------------------------------------
 */
const createCourseOffering = async (data, options = {}) => {
  return await CourseOffering.create(
    data,
    options
  );
};

/**
 * ------------------------------------------------------------------
 * Update Course Offering
 * ------------------------------------------------------------------
 */
const updateCourseOffering = async (
  courseOffering,
  data,
  options = {}
) => {
  return await courseOffering.update(
    data,
    options
  );
};

/**
 * ------------------------------------------------------------------
 * Delete Course Offering
 * ------------------------------------------------------------------
 */
const deleteCourseOffering = async (
  courseOffering,
  options = {}
) => {
  return await courseOffering.destroy(
    options
  );
};

export default {
  findAllCourseOfferings,
  findCourseOfferingById,
  findCourseById,
  findBatchById,
  findSemesterById,
  findFacultyById,
  createCourseOffering,
  updateCourseOffering,
  deleteCourseOffering,
};