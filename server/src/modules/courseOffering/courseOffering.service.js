/**
 * ------------------------------------------------------------------
 * Course Offering Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import sequelize from "../../database/connection.js";

import courseOfferingRepository from "./courseOffering.repository.js";

import ApiError from "../../shared/errors/ApiError.js";

import Faculty from "../../database/models/Faculty.js";

/**
 * ------------------------------------------------------------------
 * Get All Course Offerings
 * ------------------------------------------------------------------
 */

const getAllCourseOfferings = async () => {
  return await courseOfferingRepository.findAllCourseOfferings();
};


/**
 * ------------------------------------------------------------------
 * Get My Course Offerings
 * ------------------------------------------------------------------
 *
 * Flow:
 *
 * JWT
 *   ↓
 * req.user.email
 *   ↓
 * Faculty
 *   ↓
 * Faculty.id
 *   ↓
 * course_offerings.faculty_id
 *
 * ------------------------------------------------------------------
 */

const getMyCourseOfferings = async (user) => {

  if (!user) {
    throw new ApiError(
      401,
      "Authenticated user information is unavailable."
    );
  }

  if (!user.email) {
    throw new ApiError(
      401,
      "Authenticated user email is unavailable."
    );
  }

  /**
   * --------------------------------------------------------------
   * Find Faculty
   * --------------------------------------------------------------
   */

  const faculty = await Faculty.findOne({
    where: {
      email: user.email,
      status: true,
    },
  });

  if (!faculty) {
    throw new ApiError(
      404,
      "Active faculty profile not found."
    );
  }

  console.log(
    "MY COURSES - FACULTY:",
    {
      id: faculty.id,
      name: `${faculty.firstName} ${faculty.lastName}`,
      email: faculty.email,
    }
  );

  /**
   * --------------------------------------------------------------
   * Get Course Offerings
   * --------------------------------------------------------------
   */

  const courseOfferings =
    await courseOfferingRepository
      .findCourseOfferingsByFacultyId(
        faculty.id
      );

  console.log(
    "MY COURSES - RESULT COUNT:",
    courseOfferings.length
  );

  return courseOfferings;
};


/**
 * ------------------------------------------------------------------
 * Get Course Offering By ID
 * ------------------------------------------------------------------
 */

const getCourseOfferingById = async (id) => {

  const courseOffering =
    await courseOfferingRepository
      .findCourseOfferingById(id);

  if (!courseOffering) {
    throw new ApiError(
      404,
      "Course offering not found."
    );
  }

  return courseOffering;
};


/**
 * ------------------------------------------------------------------
 * Create Course Offering
 * ------------------------------------------------------------------
 */

const createCourseOffering = async ({
  courseId,
  batchId,
  semesterId,
  facultyId,
  section,
}) => {

  /**
   * --------------------------------------------------------------
   * Validate Course
   * --------------------------------------------------------------
   */

  const course =
    await courseOfferingRepository
      .findCourseById(courseId);

  if (!course) {
    throw new ApiError(
      404,
      "Course not found."
    );
  }


  /**
   * --------------------------------------------------------------
   * Validate Batch
   * --------------------------------------------------------------
   */

  const batch =
    await courseOfferingRepository
      .findBatchById(batchId);

  if (!batch) {
    throw new ApiError(
      404,
      "Batch not found."
    );
  }


  /**
   * --------------------------------------------------------------
   * Validate Semester
   * --------------------------------------------------------------
   */

  const semester =
    await courseOfferingRepository
      .findSemesterById(semesterId);

  if (!semester) {
    throw new ApiError(
      404,
      "Semester not found."
    );
  }


  /**
   * --------------------------------------------------------------
   * Validate Faculty
   * --------------------------------------------------------------
   */

  const faculty =
    await courseOfferingRepository
      .findFacultyById(facultyId);

  if (!faculty) {
    throw new ApiError(
      404,
      "Faculty not found."
    );
  }

  if (!faculty.status) {
    throw new ApiError(
      403,
      "Faculty is not approved or active."
    );
  }


  /**
   * --------------------------------------------------------------
   * Check Duplicate
   * --------------------------------------------------------------
   */

  const existingOfferings =
    await courseOfferingRepository
      .findAllCourseOfferings();

  const duplicate =
    existingOfferings.find(
      (offering) =>
        offering.courseId === courseId &&
        offering.batchId === batchId &&
        offering.semesterId === semesterId &&
        offering.facultyId === facultyId &&
        (offering.section || null) ===
          (section || null)
    );

  if (duplicate) {
    throw new ApiError(
      409,
      "This course offering already exists."
    );
  }


  /**
   * --------------------------------------------------------------
   * Create
   * --------------------------------------------------------------
   */

  const transaction =
    await sequelize.transaction();

  try {

    const courseOffering =
      await courseOfferingRepository
        .createCourseOffering(
          {
            courseId,
            batchId,
            semesterId,
            facultyId,
            section:
              section?.trim() || null,
            status: true,
          },
          {
            transaction,
          }
        );

    await transaction.commit();

    return await courseOfferingRepository
      .findCourseOfferingById(
        courseOffering.id
      );

  } catch (error) {

    await transaction.rollback();

    throw error;
  }
};


/**
 * ------------------------------------------------------------------
 * Update Course Offering
 * ------------------------------------------------------------------
 */

const updateCourseOffering = async (
  id,
  data
) => {

  const courseOffering =
    await courseOfferingRepository
      .findCourseOfferingById(id);

  if (!courseOffering) {
    throw new ApiError(
      404,
      "Course offering not found."
    );
  }


  /**
   * --------------------------------------------------------------
   * Validate Faculty
   * --------------------------------------------------------------
   */

  if (data.facultyId) {

    const faculty =
      await courseOfferingRepository
        .findFacultyById(
          data.facultyId
        );

    if (!faculty) {
      throw new ApiError(
        404,
        "Faculty not found."
      );
    }

    if (!faculty.status) {
      throw new ApiError(
        403,
        "Faculty is not approved or active."
      );
    }
  }


  await courseOfferingRepository
    .updateCourseOffering(
      courseOffering,
      data
    );


  return await courseOfferingRepository
    .findCourseOfferingById(id);
};


/**
 * ------------------------------------------------------------------
 * Delete Course Offering
 * ------------------------------------------------------------------
 */

const deleteCourseOffering = async (id) => {

  const courseOffering =
    await courseOfferingRepository
      .findCourseOfferingById(id);

  if (!courseOffering) {
    throw new ApiError(
      404,
      "Course offering not found."
    );
  }

  await courseOfferingRepository
    .deleteCourseOffering(
      courseOffering
    );

  return {
    id,
    deleted: true,
  };
};


/**
 * ------------------------------------------------------------------
 * Export
 * ------------------------------------------------------------------
 */

export default {
  getAllCourseOfferings,
  getMyCourseOfferings,
  getCourseOfferingById,
  createCourseOffering,
  updateCourseOffering,
  deleteCourseOffering,
};