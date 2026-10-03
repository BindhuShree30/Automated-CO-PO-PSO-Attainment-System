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
import AcademicYear from "../../database/models/AcademicYear.js";
import Faculty from "../../database/models/Faculty.js";

/**
 * ------------------------------------------------------------------
 * Course Offering Includes
 * ------------------------------------------------------------------
 */

const courseOfferingIncludes = [
  {
    model: Course,
    as: "course",
    required: false,
  },

  {
    model: Batch,
    as: "batch",
    required: false,
  },

  {
    model: Semester,
    as: "semester",
    required: false,

    include: [
      {
        model: AcademicYear,
        as: "academicYear",
        required: false,
      },
    ],
  },

  {
    model: Faculty,
    as: "faculty",
    required: false,
  },
];


/**
 * ------------------------------------------------------------------
 * Get All Course Offerings
 * ------------------------------------------------------------------
 */

const findAllCourseOfferings = async () => {

  return await CourseOffering.findAll({

    include: courseOfferingIncludes,

    order: [
      ["createdAt", "DESC"],
    ],

  });
};


/**
 * ------------------------------------------------------------------
 * Get Course Offerings By Faculty
 * ------------------------------------------------------------------
 */

const findCourseOfferingsByFacultyId = async (
  facultyId
) => {

  return await CourseOffering.findAll({

    where: {
      facultyId,
      status: true,
    },

    include: courseOfferingIncludes,

    order: [
      ["createdAt", "DESC"],
    ],

  });
};


/**
 * ------------------------------------------------------------------
 * Find Course Offering By Faculty And Course
 * ------------------------------------------------------------------
 */

const findCourseOfferingByFacultyAndCourse = async (
  facultyId,
  courseId
) => {

  return await CourseOffering.findOne({

    where: {
      facultyId,
      courseId,
      status: true,
    },

    include: courseOfferingIncludes,

  });
};


/**
 * ------------------------------------------------------------------
 * Get Course Offering By ID
 * ------------------------------------------------------------------
 */

const findCourseOfferingById = async (
  id
) => {

  return await CourseOffering.findByPk(

    id,

    {
      include: courseOfferingIncludes,
    }

  );
};


/**
 * ------------------------------------------------------------------
 * Find Course
 * ------------------------------------------------------------------
 */

const findCourseById = async (
  courseId
) => {

  return await Course.findByPk(
    courseId
  );
};


/**
 * ------------------------------------------------------------------
 * Find Batch
 * ------------------------------------------------------------------
 */

const findBatchById = async (
  batchId
) => {

  return await Batch.findByPk(
    batchId
  );
};


/**
 * ------------------------------------------------------------------
 * Find Semester
 * ------------------------------------------------------------------
 */

const findSemesterById = async (
  semesterId
) => {

  return await Semester.findByPk(
    semesterId
  );
};


/**
 * ------------------------------------------------------------------
 * Find Faculty
 * ------------------------------------------------------------------
 */

const findFacultyById = async (
  facultyId
) => {

  return await Faculty.findByPk(
    facultyId
  );
};


/**
 * ------------------------------------------------------------------
 * Create Course Offering
 * ------------------------------------------------------------------
 */

const createCourseOffering = async (
  data,
  options = {}
) => {

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


/**
 * ------------------------------------------------------------------
 * Export
 * ------------------------------------------------------------------
 */

export default {

  findAllCourseOfferings,

  findCourseOfferingsByFacultyId,

  findCourseOfferingByFacultyAndCourse,

  findCourseOfferingById,

  findCourseById,

  findBatchById,

  findSemesterById,

  findFacultyById,

  createCourseOffering,

  updateCourseOffering,

  deleteCourseOffering,

};