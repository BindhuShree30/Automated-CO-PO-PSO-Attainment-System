import coRepository from "./co.repository.js";
import courseRepository from "../course/course.repository.js";

/**
 * ------------------------------------------------------------------
 * Create Course Outcome
 * ------------------------------------------------------------------
 */
const createCO = async (data) => {
  const course = await courseRepository.findById(data.courseId);

  if (!course) {
    throw new Error("Course not found.");
  }

  const existingNumber = await coRepository.findByCourseAndNumber(
    data.courseId,
    data.coNumber
  );

  if (existingNumber) {
    throw new Error("CO Number already exists for this course.");
  }

  const existingCode = await coRepository.findByCourseAndCode(
    data.courseId,
    data.code
  );

  if (existingCode) {
    throw new Error("CO Code already exists for this course.");
  }

  return await coRepository.create(data);
};

/**
 * ------------------------------------------------------------------
 * Get All Course Outcomes
 * ------------------------------------------------------------------
 */
const getCOs = async () => {
  return await coRepository.findAll();
};

/**
 * ------------------------------------------------------------------
 * Get Course Outcome By ID
 * ------------------------------------------------------------------
 */
const getCOById = async (id) => {
  const co = await coRepository.findById(id);

  if (!co) {
    throw new Error("Course Outcome not found.");
  }

  return co;
};

/**
 * ------------------------------------------------------------------
 * Get Course Outcomes By Course
 * ------------------------------------------------------------------
 */
const getCOsByCourse = async (courseId) => {
  return await coRepository.findByCourseId(courseId);
};

/**
 * ------------------------------------------------------------------
 * Update Course Outcome
 * ------------------------------------------------------------------
 */
const updateCO = async (id, data) => {
  const co = await coRepository.findById(id);

  if (!co) {
    throw new Error("Course Outcome not found.");
  }

  if (
    data.coNumber &&
    data.coNumber !== co.coNumber
  ) {
    const duplicate = await coRepository.findByCourseAndNumber(
      co.courseId,
      data.coNumber
    );

    if (duplicate && duplicate.id !== id) {
      throw new Error("CO Number already exists for this course.");
    }
  }

  if (
    data.code &&
    data.code !== co.code
  ) {
    const duplicate = await coRepository.findByCourseAndCode(
      co.courseId,
      data.code
    );

    if (duplicate && duplicate.id !== id) {
      throw new Error("CO Code already exists for this course.");
    }
  }

  return await coRepository.update(co, data);
};

/**
 * ------------------------------------------------------------------
 * Delete Course Outcome
 * ------------------------------------------------------------------
 */
const deleteCO = async (id) => {
  const co = await coRepository.findById(id);

  if (!co) {
    throw new Error("Course Outcome not found.");
  }

  await coRepository.remove(co);

  return {
    message: "Course Outcome deleted successfully.",
  };
};

export default {
  createCO,
  getCOs,
  getCOById,
  getCOsByCourse,
  updateCO,
  deleteCO,
};