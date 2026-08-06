/**
 * ------------------------------------------------------------------
 * Course Registration Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 * Handles Course Registration business rules.
 * ------------------------------------------------------------------
 */

import courseRegistrationRepository from "./courseRegistration.repository.js";
import enrollmentRepository from "../enrollment/enrollment.repository.js";
import studentRepository from "../student/student.repository.js";
import courseOfferingRepository from "../courseOffering/courseOffering.repository.js";

import ApiError from "../../shared/errors/ApiError.js";

class CourseRegistrationService {
  /**
   * Validate Student and Course Offering relationship
   */
  async validateStudentCourseOffering(
    studentId,
    courseOfferingId
  ) {
    /**
     * Validate Student
     */
    const student =
      await studentRepository.findStudentById(studentId);

    if (!student) {
      throw new ApiError(
        404,
        "Student not found."
      );
    }

    /**
     * Validate Course Offering
     */
    const courseOffering =
      await courseOfferingRepository.findById(
        courseOfferingId
      );

    if (!courseOffering) {
      throw new ApiError(
        404,
        "Course Offering not found."
      );
    }

    /**
     * Student must belong to the same Program
     * as the Course Offering's Course
     */
    if (
      student.programId !==
      courseOffering.course.programId
    ) {
      throw new ApiError(
        400,
        "Student and Course Offering must belong to the same Program."
      );
    }

    /**
     * Student must be enrolled in the
     * Course Offering's Batch
     */
    const enrollment =
      await enrollmentRepository.findByStudentAndBatch(
        studentId,
        courseOffering.batchId
      );

    if (!enrollment) {
      throw new ApiError(
        400,
        "Student is not enrolled in the Course Offering Batch."
      );
    }

    /**
     * Enrollment must be active
     */
    if (!enrollment.status) {
      throw new ApiError(
        400,
        "Student Enrollment is inactive."
      );
    }

    /**
     * Student must be active
     */
    if (!student.status) {
      throw new ApiError(
        400,
        "Student is inactive."
      );
    }

    /**
     * Course Offering must be active
     */
    if (!courseOffering.status) {
      throw new ApiError(
        400,
        "Course Offering is inactive."
      );
    }

    return {
      student,
      courseOffering,
      enrollment,
    };
  }

  /**
   * Create Course Registration
   */
  async createCourseRegistration(data) {
    const {
      studentId,
      courseOfferingId,
      registrationDate,
      status,
    } = data;

    /**
     * Validate academic relationship
     */
    await this.validateStudentCourseOffering(
      studentId,
      courseOfferingId
    );

    /**
     * Prevent duplicate registration
     */
    const existingRegistration =
      await courseRegistrationRepository
        .findByStudentAndCourseOffering(
          studentId,
          courseOfferingId
        );

    if (existingRegistration) {
      throw new ApiError(
        409,
        "Student is already registered for this Course Offering."
      );
    }

    const courseRegistration =
      await courseRegistrationRepository.create({
        studentId,
        courseOfferingId,
        registrationDate,
        status,
      });

    return courseRegistrationRepository.findById(
      courseRegistration.id
    );
  }

  /**
   * Get All Course Registrations
   */
  async getCourseRegistrations() {
    return courseRegistrationRepository.findAll();
  }

  /**
   * Get Course Registration By ID
   */
  async getCourseRegistrationById(id) {
    const courseRegistration =
      await courseRegistrationRepository.findById(id);

    if (!courseRegistration) {
      throw new ApiError(
        404,
        "Course Registration not found."
      );
    }

    return courseRegistration;
  }

  /**
   * Update Course Registration
   */
  async updateCourseRegistration(id, data) {
    const courseRegistration =
      await courseRegistrationRepository.findById(id);

    if (!courseRegistration) {
      throw new ApiError(
        404,
        "Course Registration not found."
      );
    }

    /**
     * Resolve final relationship
     */
    const studentId =
      data.studentId ?? courseRegistration.studentId;

    const courseOfferingId =
      data.courseOfferingId ??
      courseRegistration.courseOfferingId;

    /**
     * Validate final academic relationship
     */
    await this.validateStudentCourseOffering(
      studentId,
      courseOfferingId
    );

    /**
     * Prevent duplicate registration
     */
    if (
      studentId !== courseRegistration.studentId ||
      courseOfferingId !==
        courseRegistration.courseOfferingId
    ) {
      const existingRegistration =
        await courseRegistrationRepository
          .findByStudentAndCourseOffering(
            studentId,
            courseOfferingId
          );

      if (
        existingRegistration &&
        existingRegistration.id !==
          courseRegistration.id
      ) {
        throw new ApiError(
          409,
          "Student is already registered for this Course Offering."
        );
      }
    }

    return courseRegistrationRepository.update(
      id,
      data
    );
  }

  /**
   * Delete Course Registration
   */
  async deleteCourseRegistration(id) {
    const courseRegistration =
      await courseRegistrationRepository.findById(id);

    if (!courseRegistration) {
      throw new ApiError(
        404,
        "Course Registration not found."
      );
    }

    await courseRegistrationRepository.delete(id);

    return true;
  }
}

export default new CourseRegistrationService();