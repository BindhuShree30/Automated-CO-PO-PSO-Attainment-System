/**
 * ------------------------------------------------------------------
 * Student Repository
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 * Handles Student database operations.
 * ------------------------------------------------------------------
 */

import Student from "../../database/models/Student.js";
import Program from "../../database/models/Program.js";

/**
 * Common Student associations
 */
const studentIncludes = [
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
];

class StudentRepository {
  /**
   * Create Student
   */
  async createStudent(studentData) {
    return Student.create(studentData);
  }

  /**
   * Find Student By ID
   */
  async findStudentById(id) {
    return Student.findByPk(id, {
      include: studentIncludes,
    });
  }

  /**
   * Find Student By USN
   */
  async findStudentByUSN(usn) {
    return Student.findOne({
      where: {
        usn,
      },
    });
  }

  /**
   * Find Student By Email
   */
  async findStudentByEmail(email) {
    return Student.findOne({
      where: {
        email,
      },
    });
  }

  /**
   * Get All Students
   */
  async findAllStudents() {
    return Student.findAll({
      include: studentIncludes,
      order: [["createdAt", "DESC"]],
    });
  }

  /**
   * Update Student
   */
  async updateStudent(student, data) {
    await student.update(data);

    return this.findStudentById(student.id);
  }

  /**
   * Delete Student
   */
  async deleteStudent(student) {
    await student.destroy();

    return true;
  }
}

export default new StudentRepository();