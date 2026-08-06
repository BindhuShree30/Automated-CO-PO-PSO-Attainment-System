import { CourseOutcome, Course } from "../../database/index.js";

/**
 * ------------------------------------------------------------------
 * Create Course Outcome
 * ------------------------------------------------------------------
 */
const create = async (data) => {
  return await CourseOutcome.create(data);
};

/**
 * ------------------------------------------------------------------
 * Get All Course Outcomes
 * ------------------------------------------------------------------
 */
const findAll = async () => {
  return await CourseOutcome.findAll({
    include: [
      {
        model: Course,
        as: "course",
      },
    ],
    order: [
      ["courseId", "ASC"],
      ["code", "ASC"],
    ],
  });
};

/**
 * ------------------------------------------------------------------
 * Get Course Outcome By ID
 * ------------------------------------------------------------------
 */
const findById = async (id) => {
  return await CourseOutcome.findByPk(id, {
    include: [
      {
        model: Course,
        as: "course",
      },
    ],
  });
};

/**
 * ------------------------------------------------------------------
 * Get Course Outcomes By Course
 * ------------------------------------------------------------------
 */
const findByCourseId = async (courseId) => {
  return await CourseOutcome.findAll({
    where: {
      courseId,
      status: true,
    },
    order: [["code", "ASC"]],
  });
};

/**
 * ------------------------------------------------------------------
 * Update Course Outcome
 * ------------------------------------------------------------------
 */
const update = async (co, data) => {
  return await co.update(data);
};
/**
 * ------------------------------------------------------------------
 * Find CO by Course and CO Number
 * ------------------------------------------------------------------
 */
const findByCourseAndNumber = async (courseId, coNumber) => {
  return await CourseOutcome.findOne({
    where: {
      courseId,
      coNumber,
    },
  });
};

/**
 * ------------------------------------------------------------------
 * Find CO by Course and Code
 * ------------------------------------------------------------------
 */
const findByCourseAndCode = async (courseId, code) => {
  return await CourseOutcome.findOne({
    where: {
      courseId,
      code,
    },
  });
};

/**
 * ------------------------------------------------------------------
 * Delete Course Outcome
 * ------------------------------------------------------------------
 */
const remove = async (co) => {
  return await co.destroy();
};

export default {
  create,
  findAll,
  findById,
  findByCourseId,
  findByCourseAndNumber,
  findByCourseAndCode,
  update,
  remove,
};