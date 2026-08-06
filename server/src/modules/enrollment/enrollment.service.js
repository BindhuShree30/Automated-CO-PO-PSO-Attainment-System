/**
 * ------------------------------------------------------------------
 * Enrollment Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 * Handles Enrollment business rules.
 * ------------------------------------------------------------------
 */

import enrollmentRepository from "./enrollment.repository.js";

import Student from "../../database/models/Student.js";
import Batch from "../../database/models/Batch.js";

import ApiError from "../../shared/errors/ApiError.js";

class EnrollmentService {
  /**
   * Validate Student and Batch relationship
   */
  async validateStudentBatchRelationship(studentId, batchId) {
    const student = await Student.findByPk(studentId);

    if (!student) {
      throw new ApiError(
        404,
        "Student not found."
      );
    }

    const batch = await Batch.findByPk(batchId);

    if (!batch) {
      throw new ApiError(
        404,
        "Batch not found."
      );
    }

    if (student.programId !== batch.programId) {
      throw new ApiError(
        400,
        "Student and Batch must belong to the same Program."
      );
    }

    return {
      student,
      batch,
    };
  }

  /**
   * Create Enrollment
   */
  async createEnrollment(data) {
    const {
      studentId,
      batchId,
      enrollmentDate,
      status,
    } = data;

    /**
     * Validate Student-Batch relationship
     */
    await this.validateStudentBatchRelationship(
      studentId,
      batchId
    );

    /**
     * Prevent duplicate Student-Batch Enrollment
     */
    const existingEnrollment =
      await enrollmentRepository.findByStudentAndBatch(
        studentId,
        batchId
      );

    if (existingEnrollment) {
      throw new ApiError(
        409,
        "Student is already enrolled in this Batch."
      );
    }

    const enrollment =
      await enrollmentRepository.create({
        studentId,
        batchId,
        enrollmentDate,
        status,
      });

    return enrollmentRepository.findById(
      enrollment.id
    );
  }

  /**
   * Get All Enrollments
   */
  async getEnrollments() {
    return enrollmentRepository.findAll();
  }

  /**
   * Get Enrollment By ID
   */
  async getEnrollmentById(id) {
    const enrollment =
      await enrollmentRepository.findById(id);

    if (!enrollment) {
      throw new ApiError(
        404,
        "Enrollment not found."
      );
    }

    return enrollment;
  }

  /**
   * Update Enrollment
   */
  async updateEnrollment(id, data) {
    const enrollment =
      await enrollmentRepository.findById(id);

    if (!enrollment) {
      throw new ApiError(
        404,
        "Enrollment not found."
      );
    }

    /**
     * Resolve final Student and Batch IDs
     */
    const studentId =
      data.studentId ?? enrollment.studentId;

    const batchId =
      data.batchId ?? enrollment.batchId;

    /**
     * Validate final Student-Batch relationship
     */
    await this.validateStudentBatchRelationship(
      studentId,
      batchId
    );

    /**
     * Prevent duplicate Student-Batch Enrollment
     */
    if (
      studentId !== enrollment.studentId ||
      batchId !== enrollment.batchId
    ) {
      const existingEnrollment =
        await enrollmentRepository.findByStudentAndBatch(
          studentId,
          batchId
        );

      if (
        existingEnrollment &&
        existingEnrollment.id !== enrollment.id
      ) {
        throw new ApiError(
          409,
          "Student is already enrolled in this Batch."
        );
      }
    }

    const updatedEnrollment =
      await enrollmentRepository.update(
        id,
        data
      );

    return updatedEnrollment;
  }

  /**
   * Delete Enrollment
   */
  async deleteEnrollment(id) {
    const enrollment =
      await enrollmentRepository.findById(id);

    if (!enrollment) {
      throw new ApiError(
        404,
        "Enrollment not found."
      );
    }

    await enrollmentRepository.delete(id);

    return true;
  }
}

export default new EnrollmentService();