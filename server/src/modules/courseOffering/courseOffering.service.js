/**
 * ------------------------------------------------------------------
 * Course Offering Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 * Handles Course Offering business logic.
 * ------------------------------------------------------------------
 */

import CourseOfferingRepository from "./courseOffering.repository.js";

import Course from "../../database/models/Course.js";
import Batch from "../../database/models/Batch.js";
import Semester from "../../database/models/Semester.js";
import Faculty from "../../database/models/Faculty.js";

import ApiError from "../../shared/errors/ApiError.js";

class CourseOfferingService {
  /**
   * Normalize Section
   */
  normalizeSection(section) {
    if (section === undefined || section === null) {
      return null;
    }

    const normalizedSection = section
      .trim()
      .toUpperCase();

    return normalizedSection || null;
  }

  /**
   * Validate Course
   */
  async validateCourse(courseId) {
    const course = await Course.findByPk(courseId);

    if (!course) {
      throw new ApiError(
        404,
        "Course not found."
      );
    }

    return course;
  }

  /**
   * Validate Batch
   */
  async validateBatch(batchId) {
    const batch = await Batch.findByPk(batchId);

    if (!batch) {
      throw new ApiError(
        404,
        "Batch not found."
      );
    }

    return batch;
  }

  /**
   * Validate Semester
   */
  async validateSemester(semesterId) {
    const semester = await Semester.findByPk(
      semesterId
    );

    if (!semester) {
      throw new ApiError(
        404,
        "Semester not found."
      );
    }

    return semester;
  }

  /**
   * Validate Faculty
   */
  async validateFaculty(facultyId) {
    const faculty = await Faculty.findByPk(
      facultyId
    );

    if (!faculty) {
      throw new ApiError(
        404,
        "Faculty not found."
      );
    }

    return faculty;
  }

  /**
   * Validate Course Offering Relationships
   */
  validateRelationships(
    course,
    batch,
    semester
  ) {
    /**
     * Semester must belong to selected Batch
     */
    if (semester.batchId !== batch.id) {
      throw new ApiError(
        400,
        "Semester does not belong to the selected Batch."
      );
    }

    /**
     * Course must belong to the same Program
     * as the selected Batch
     */
    if (course.programId !== batch.programId) {
      throw new ApiError(
        400,
        "Course and Batch must belong to the same Program."
      );
    }
  }

  /**
   * Create Course Offering
   */
  async createCourseOffering(data) {
    const {
      courseId,
      batchId,
      semesterId,
      facultyId,
    } = data;

    const course = await this.validateCourse(
      courseId
    );

    const batch = await this.validateBatch(
      batchId
    );

    const semester =
      await this.validateSemester(semesterId);

    await this.validateFaculty(facultyId);

    this.validateRelationships(
      course,
      batch,
      semester
    );

    const section = this.normalizeSection(
      data.section
    );

    const existingCourseOffering =
      await CourseOfferingRepository.findDuplicate(
        courseId,
        batchId,
        semesterId,
        section
      );

    if (existingCourseOffering) {
      throw new ApiError(
        409,
        "Course Offering already exists for this Course, Batch, Semester and Section."
      );
    }

    return CourseOfferingRepository.create({
      ...data,
      section,
    });
  }

  /**
   * Get All Course Offerings
   */
  async getAllCourseOfferings() {
    return CourseOfferingRepository.findAll();
  }

  /**
   * Get Course Offering By ID
   */
  async getCourseOfferingById(id) {
    const courseOffering =
      await CourseOfferingRepository.findById(id);

    if (!courseOffering) {
      throw new ApiError(
        404,
        "Course Offering not found."
      );
    }

    return courseOffering;
  }

  /**
   * Update Course Offering
   */
  async updateCourseOffering(id, data) {
    const courseOffering =
      await CourseOfferingRepository.findById(id);

    if (!courseOffering) {
      throw new ApiError(
        404,
        "Course Offering not found."
      );
    }

    const courseId =
      data.courseId ?? courseOffering.courseId;

    const batchId =
      data.batchId ?? courseOffering.batchId;

    const semesterId =
      data.semesterId ??
      courseOffering.semesterId;

    const facultyId =
      data.facultyId ??
      courseOffering.facultyId;

    const course = await this.validateCourse(
      courseId
    );

    const batch = await this.validateBatch(
      batchId
    );

    const semester =
      await this.validateSemester(semesterId);

    await this.validateFaculty(facultyId);

    this.validateRelationships(
      course,
      batch,
      semester
    );

    const section =
      data.section !== undefined
        ? this.normalizeSection(data.section)
        : courseOffering.section;

    const existingCourseOffering =
      await CourseOfferingRepository.findDuplicate(
        courseId,
        batchId,
        semesterId,
        section
      );

    if (
      existingCourseOffering &&
      existingCourseOffering.id !== id
    ) {
      throw new ApiError(
        409,
        "Course Offering already exists for this Course, Batch, Semester and Section."
      );
    }

    return CourseOfferingRepository.update(id, {
      ...data,
      courseId,
      batchId,
      semesterId,
      facultyId,
      section,
    });
  }

  /**
   * Delete Course Offering
   */
  async deleteCourseOffering(id) {
    const deleted =
      await CourseOfferingRepository.delete(id);

    if (!deleted) {
      throw new ApiError(
        404,
        "Course Offering not found."
      );
    }

    return true;
  }
}

export default new CourseOfferingService();