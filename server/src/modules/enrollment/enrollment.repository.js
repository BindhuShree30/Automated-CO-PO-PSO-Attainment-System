/**
 * ------------------------------------------------------------------
 * Enrollment Repository
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 * Handles Enrollment database operations.
 * ------------------------------------------------------------------
 */

import Enrollment from "../../database/models/Enrollment.js";
import Student from "../../database/models/Student.js";
import Batch from "../../database/models/Batch.js";
import Program from "../../database/models/Program.js";

/**
 * Common Enrollment associations
 */
const enrollmentIncludes = [
  {
    model: Student,
    as: "student",
    attributes: [
      "id",
      "usn",
      "firstName",
      "lastName",
      "email",
      "phone",
      "programId",
      "status",
    ],
  },
  {
    model: Batch,
    as: "batch",
    attributes: [
      "id",
      "name",
      "startYear",
      "endYear",
      "programId",
      "status",
    ],
    include: [
      {
        model: Program,
        as: "program",
        attributes: [
          "id",
          "name",
          "code",
          "duration",
          "status",
        ],
      },
    ],
  },
];

class EnrollmentRepository {
  /**
   * Create Enrollment
   */
  async create(data) {
    return Enrollment.create(data);
  }

  /**
   * Get All Enrollments
   */
  async findAll() {
    return Enrollment.findAll({
      include: enrollmentIncludes,
      order: [["createdAt", "DESC"]],
    });
  }

  /**
   * Get Enrollment By ID
   */
  async findById(id) {
    return Enrollment.findByPk(id, {
      include: enrollmentIncludes,
    });
  }

  /**
   * Find Enrollment By Student and Batch
   */
  async findByStudentAndBatch(studentId, batchId) {
    return Enrollment.findOne({
      where: {
        studentId,
        batchId,
      },
    });
  }

  /**
   * Find Enrollments By Student ID
   */
  async findByStudentId(studentId) {
    return Enrollment.findAll({
      where: {
        studentId,
      },
      include: enrollmentIncludes,
      order: [["enrollmentDate", "DESC"]],
    });
  }

  /**
   * Find Enrollments By Batch ID
   */
  async findByBatchId(batchId) {
    return Enrollment.findAll({
      where: {
        batchId,
      },
      include: enrollmentIncludes,
      order: [["createdAt", "DESC"]],
    });
  }

  /**
   * Update Enrollment
   */
  async update(id, data) {
    const enrollment = await Enrollment.findByPk(id);

    if (!enrollment) {
      return null;
    }

    await enrollment.update(data);

    return this.findById(id);
  }

  /**
   * Delete Enrollment
   */
  async delete(id) {
    const enrollment = await Enrollment.findByPk(id);

    if (!enrollment) {
      return false;
    }

    await enrollment.destroy();

    return true;
  }
}

export default new EnrollmentRepository();