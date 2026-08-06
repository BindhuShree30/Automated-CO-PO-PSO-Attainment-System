/**
 * ------------------------------------------------------------------
 * CO Attainment Repository
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import COAttainment from "../../database/models/COAttainment.js";
import CourseOffering from "../../database/models/CourseOffering.js";
import CourseOutcome from "../../database/models/CourseOutcome.js";
import Course from "../../database/models/Course.js";

/**
 * Common CO Attainment Includes
 */
const coAttainmentIncludes = [
  {
    model: CourseOffering,
    as: "courseOffering",
    attributes: [
      "id",
      "courseId",
      "batchId",
      "semesterId",
      "facultyId",
      "section",
      "status",
    ],
    include: [
      {
        model: Course,
        as: "course",
        attributes: [
          "id",
          "name",
          "code",
          "credits",
          "semester",
          "programId",
          "status",
        ],
      },
    ],
  },
  {
    model: CourseOutcome,
    as: "courseOutcome",
    attributes: [
      "id",
      "code",
      "description",
      "courseId",
      "status",
    ],
  },
];

/**
 * Create CO Attainment
 */
const createCOAttainment = async (data) => {
  return await COAttainment.create(data);
};

/**
 * Find CO Attainment By ID
 */
const findCOAttainmentById = async (id) => {
  return await COAttainment.findByPk(id, {
    include: coAttainmentIncludes,
  });
};

/**
 * Find By Course Offering and Course Outcome
 */
const findByCourseOfferingAndCO = async (
  courseOfferingId,
  courseOutcomeId
) => {
  return await COAttainment.findOne({
    where: {
      courseOfferingId,
      courseOutcomeId,
    },
    include: coAttainmentIncludes,
  });
};

/**
 * Find All CO Attainments
 */
const findAllCOAttainments = async () => {
  return await COAttainment.findAll({
    include: coAttainmentIncludes,
    order: [["createdAt", "ASC"]],
  });
};

/**
 * Find CO Attainments By Course Offering
 */
const findByCourseOfferingId = async (courseOfferingId) => {
  return await COAttainment.findAll({
    where: {
      courseOfferingId,
    },
    include: coAttainmentIncludes,
    order: [["createdAt", "ASC"]],
  });
};

/**
 * Find CO Attainments By Course Outcome
 */
const findByCourseOutcomeId = async (courseOutcomeId) => {
  return await COAttainment.findAll({
    where: {
      courseOutcomeId,
    },
    include: coAttainmentIncludes,
    order: [["createdAt", "ASC"]],
  });
};

/**
 * Update CO Attainment
 */
const updateCOAttainment = async (
  coAttainment,
  data
) => {
  await coAttainment.update(data);

  return await findCOAttainmentById(coAttainment.id);
};

/**
 * Delete CO Attainment
 */
const deleteCOAttainment = async (coAttainment) => {
  return await coAttainment.destroy();
};

export default {
  createCOAttainment,
  findCOAttainmentById,
  findByCourseOfferingAndCO,
  findAllCOAttainments,
  findByCourseOfferingId,
  findByCourseOutcomeId,
  updateCOAttainment,
  deleteCOAttainment,
};