/**
 * ------------------------------------------------------------------
 * Semester Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import SemesterRepository from "./semester.repository.js";
import Batch from "../../database/models/Batch.js";
import Program from "../../database/models/Program.js";
import AcademicYear from "../../database/models/AcademicYear.js";
import ApiError from "../../shared/errors/ApiError.js";

class SemesterService {
  /**
   * Get Batch and Program
   */
  async getBatchAndProgram(batchId) {
    const batch = await Batch.findByPk(batchId);

    if (!batch) {
      throw new ApiError(404, "Batch not found.");
    }

    const program = await Program.findByPk(batch.programId);

    if (!program) {
      throw new ApiError(404, "Program not found.");
    }

    return {
      batch,
      program,
    };
  }

  /**
   * Validate Semester Number
   */
  validateSemesterNumber(semesterNumber, program) {
    const maximumSemesters = program.duration * 2;

    if (
      semesterNumber < 1 ||
      semesterNumber > maximumSemesters
    ) {
      throw new ApiError(
        400,
        `Semester number must be between 1 and ${maximumSemesters} for this Program.`
      );
    }
  }

  /**
   * Calculate Semester Term
   */
  calculateTerm(semesterNumber) {
    return semesterNumber % 2 === 0
      ? "EVEN"
      : "ODD";
  }

  /**
   * Calculate Expected Academic Year
   */
  calculateExpectedAcademicYear(batch, semesterNumber) {
    const yearOffset = Math.floor(
      (semesterNumber - 1) / 2
    );

    return {
      startYear: batch.startYear + yearOffset,
      endYear: batch.startYear + yearOffset + 1,
    };
  }

  /**
   * Validate Academic Year
   */
  async validateAcademicYear(
    academicYearId,
    batch,
    semesterNumber
  ) {
    const academicYear = await AcademicYear.findByPk(
      academicYearId
    );

    if (!academicYear) {
      throw new ApiError(
        404,
        "Academic Year not found."
      );
    }

    const expectedAcademicYear =
      this.calculateExpectedAcademicYear(
        batch,
        semesterNumber
      );

    if (
      academicYear.startYear !==
        expectedAcademicYear.startYear ||
      academicYear.endYear !==
        expectedAcademicYear.endYear
    ) {
      throw new ApiError(
        400,
        `Semester ${semesterNumber} must belong to Academic Year ${expectedAcademicYear.startYear}-${expectedAcademicYear.endYear}.`
      );
    }

    return academicYear;
  }

  /**
   * Create Semester
   */
  async createSemester(data) {
    const {
      batchId,
      academicYearId,
      semesterNumber,
    } = data;

    const { batch, program } =
      await this.getBatchAndProgram(batchId);

    // Validate Semester range dynamically
    this.validateSemesterNumber(
      semesterNumber,
      program
    );

    // Validate Academic Year
    await this.validateAcademicYear(
      academicYearId,
      batch,
      semesterNumber
    );

    // Check duplicate Semester
    const existingSemester =
      await SemesterRepository.findByBatchAndSemesterNumber(
        batchId,
        semesterNumber
      );

    if (existingSemester) {
      throw new ApiError(
        409,
        `Semester ${semesterNumber} already exists for this Batch.`
      );
    }

    // Automatically calculate ODD / EVEN
    const term = this.calculateTerm(semesterNumber);

    return SemesterRepository.create({
      ...data,
      term,
    });
  }

  /**
   * Get All Semesters
   */
  async getAllSemesters() {
    return SemesterRepository.findAll();
  }

  /**
   * Get Semester By ID
   */
  async getSemesterById(id) {
    const semester =
      await SemesterRepository.findById(id);

    if (!semester) {
      throw new ApiError(
        404,
        "Semester not found."
      );
    }

    return semester;
  }

  /**
   * Update Semester
   */
  async updateSemester(id, data) {
    const semester =
      await SemesterRepository.findById(id);

    if (!semester) {
      throw new ApiError(
        404,
        "Semester not found."
      );
    }

    const batchId =
      data.batchId ?? semester.batchId;

    const academicYearId =
      data.academicYearId ??
      semester.academicYearId;

    const semesterNumber =
      data.semesterNumber ??
      semester.semesterNumber;

    const { batch, program } =
      await this.getBatchAndProgram(batchId);

    // Validate Semester range dynamically
    this.validateSemesterNumber(
      semesterNumber,
      program
    );

    // Validate Academic Year
    await this.validateAcademicYear(
      academicYearId,
      batch,
      semesterNumber
    );

    // Check duplicate Semester
    const existingSemester =
      await SemesterRepository.findByBatchAndSemesterNumber(
        batchId,
        semesterNumber
      );

    if (
      existingSemester &&
      existingSemester.id !== id
    ) {
      throw new ApiError(
        409,
        `Semester ${semesterNumber} already exists for this Batch.`
      );
    }

    // Automatically calculate term
    const term = this.calculateTerm(
      semesterNumber
    );

    return SemesterRepository.update(id, {
      ...data,
      batchId,
      academicYearId,
      semesterNumber,
      term,
    });
  }

  /**
   * Delete Semester
   */
  async deleteSemester(id) {
    const deleted =
      await SemesterRepository.delete(id);

    if (!deleted) {
      throw new ApiError(
        404,
        "Semester not found."
      );
    }

    return true;
  }
}

export default new SemesterService();