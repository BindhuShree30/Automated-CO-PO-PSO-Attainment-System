/**
 * ------------------------------------------------------------------
 * Student Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 * Handles Student business rules.
 * ------------------------------------------------------------------
 */

import studentRepository from "./student.repository.js";
import programRepository from "../program/program.repository.js";
import ApiError from "../../shared/errors/ApiError.js";

class StudentService {
  /**
   * Create Student
   */
  async createStudent(studentData) {
    const normalizedData = {
      ...studentData,
      usn: studentData.usn.toUpperCase(),
      email: studentData.email.toLowerCase(),
    };

    const { usn, email, programId } = normalizedData;

    const program =
      await programRepository.findProgramById(programId);

    if (!program) {
      throw new ApiError(404, "Program not found.");
    }

    const existingUSN =
      await studentRepository.findStudentByUSN(usn);

    if (existingUSN) {
      throw new ApiError(409, "USN already exists.");
    }

    const existingEmail =
      await studentRepository.findStudentByEmail(email);

    if (existingEmail) {
      throw new ApiError(409, "Email already exists.");
    }

    const student =
      await studentRepository.createStudent(normalizedData);

    return studentRepository.findStudentById(student.id);
  }

  /**
   * Get All Students
   */
  async getStudents() {
    return studentRepository.findAllStudents();
  }

  /**
   * Get Student By ID
   */
  async getStudentById(id) {
    const student =
      await studentRepository.findStudentById(id);

    if (!student) {
      throw new ApiError(404, "Student not found.");
    }

    return student;
  }

  /**
   * Update Student
   */
  async updateStudent(id, data) {
    const student =
      await studentRepository.findStudentById(id);

    if (!student) {
      throw new ApiError(404, "Student not found.");
    }

    const normalizedData = {
      ...data,
    };

    if (normalizedData.usn) {
      normalizedData.usn =
        normalizedData.usn.toUpperCase();
    }

    if (normalizedData.email) {
      normalizedData.email =
        normalizedData.email.toLowerCase();
    }

    if (normalizedData.programId) {
      const program =
        await programRepository.findProgramById(
          normalizedData.programId
        );

      if (!program) {
        throw new ApiError(404, "Program not found.");
      }
    }

    if (normalizedData.email) {
      const existingEmail =
        await studentRepository.findStudentByEmail(
          normalizedData.email
        );

      if (
        existingEmail &&
        existingEmail.id !== student.id
      ) {
        throw new ApiError(
          409,
          "Email already exists."
        );
      }
    }

    if (normalizedData.usn) {
      const existingUSN =
        await studentRepository.findStudentByUSN(
          normalizedData.usn
        );

      if (
        existingUSN &&
        existingUSN.id !== student.id
      ) {
        throw new ApiError(
          409,
          "USN already exists."
        );
      }
    }

    return studentRepository.updateStudent(
      student,
      normalizedData
    );
  }

  /**
   * Delete Student
   */
  async deleteStudent(id) {
    const student =
      await studentRepository.findStudentById(id);

    if (!student) {
      throw new ApiError(404, "Student not found.");
    }

    await studentRepository.deleteStudent(student);

    return true;
  }
}

export default new StudentService();