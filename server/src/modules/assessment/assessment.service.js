/**
 * ------------------------------------------------------------------
 * Assessment Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 * Handles Assessment business rules.
 * ------------------------------------------------------------------
 */

import assessmentRepository from "./assessment.repository.js";
import courseOfferingRepository from "../courseOffering/courseOffering.repository.js";

import ApiError from "../../shared/errors/ApiError.js";

class AssessmentService {
  /**
   * Validate Course Offering
   */
  async validateCourseOffering(courseOfferingId) {
    const courseOffering =
      await courseOfferingRepository.findCourseOfferingById(
        courseOfferingId
      );

    if (!courseOffering) {
      throw new ApiError(
        404,
        "Course Offering not found."
      );
    }

    if (!courseOffering.status) {
      throw new ApiError(
        400,
        "Course Offering is inactive."
      );
    }

    return courseOffering;
  }

  /**
   * Validate Assessment Values
   */
  validateAssessmentValues(maxMarks, weightage) {
    if (
      maxMarks !== undefined &&
      Number(maxMarks) <= 0
    ) {
      throw new ApiError(
        400,
        "Maximum marks must be greater than 0."
      );
    }

    if (
      weightage !== undefined &&
      (
        Number(weightage) <= 0 ||
        Number(weightage) > 100
      )
    ) {
      throw new ApiError(
        400,
        "Assessment weightage must be greater than 0 and cannot exceed 100."
      );
    }
  }

  /**
   * Create Assessment
   */
  async createAssessment(data) {
    const {
      name,
      courseOfferingId,
      maxMarks,
      weightage,
    } = data;

    /**
     * Validate Course Offering
     */
    await this.validateCourseOffering(
      courseOfferingId
    );

    /**
     * Validate Assessment values
     */
    this.validateAssessmentValues(
      maxMarks,
      weightage
    );

    /**
     * Prevent duplicate Assessment name
     * within the same Course Offering
     */
    const existingAssessment =
      await assessmentRepository
        .findByNameAndCourseOffering(
          name,
          courseOfferingId
        );

    if (existingAssessment) {
      throw new ApiError(
        409,
        "Assessment name already exists for this Course Offering."
      );
    }

    const assessment =
      await assessmentRepository.create(data);

    return assessmentRepository.findById(
      assessment.id
    );
  }

  /**
   * Get All Assessments
   */
  async getAssessments() {
    return assessmentRepository.findAll();
  }
  /**
 * Get Assessments By Course Offering
 */
async getAssessmentsByCourseOffering(courseOfferingId) {
  await this.validateCourseOffering(courseOfferingId);

  return assessmentRepository.findByCourseOfferingId(
    courseOfferingId
  );
}


  /**
   * Get Assessment By ID
   */
  async getAssessmentById(id) {
    const assessment =
      await assessmentRepository.findById(id);

    if (!assessment) {
      throw new ApiError(
        404,
        "Assessment not found."
      );
    }

    return assessment;
  }

  /**
   * Update Assessment
   */
  async updateAssessment(id, data) {
    const assessment =
      await assessmentRepository.findById(id);

    if (!assessment) {
      throw new ApiError(
        404,
        "Assessment not found."
      );
    }

    const finalName =
      data.name ?? assessment.name;

    const finalCourseOfferingId =
      data.courseOfferingId ??
      assessment.courseOfferingId;

    const finalMaxMarks =
      data.maxMarks ?? assessment.maxMarks;

    const finalWeightage =
      data.weightage ?? assessment.weightage;

    /**
     * Validate final Course Offering
     */
    await this.validateCourseOffering(
      finalCourseOfferingId
    );

    /**
     * Validate final Assessment values
     */
    this.validateAssessmentValues(
      finalMaxMarks,
      finalWeightage
    );

    /**
     * Validate final Assessment name
     * and Course Offering pair
     */
    const existingAssessment =
      await assessmentRepository
        .findByNameAndCourseOffering(
          finalName,
          finalCourseOfferingId
        );

    if (
      existingAssessment &&
      existingAssessment.id !== assessment.id
    ) {
      throw new ApiError(
        409,
        "Assessment name already exists for this Course Offering."
      );
    }

    return assessmentRepository.update(
      id,
      data
    );
  }

  /**
   * Delete Assessment
   */
  async deleteAssessment(id) {
    const assessment =
      await assessmentRepository.findById(id);

    if (!assessment) {
      throw new ApiError(
        404,
        "Assessment not found."
      );
    }

    await assessmentRepository.delete(id);

    return true;
  }
}

export default new AssessmentService();