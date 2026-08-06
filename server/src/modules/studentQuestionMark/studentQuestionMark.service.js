/**
 * ------------------------------------------------------------------
 * Student Question Mark Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import studentQuestionMarkRepository from "./studentQuestionMark.repository.js";
import studentRepository from "../student/student.repository.js";
import assessmentQuestionRepository from "../assessmentQuestion/assessmentQuestion.repository.js";
import courseRegistrationRepository from "../courseRegistration/courseRegistration.repository.js";
import ApiError from "../../shared/errors/ApiError.js";

/**
 * Create Student Question Mark
 */
const createStudentQuestionMark = async (data) => {
  const {
    studentId,
    assessmentQuestionId,
    marksObtained,
    isAbsent,
  } = data;

  /**
   * Check Student
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
   * Check Assessment Question
   */
  const assessmentQuestion =
    await assessmentQuestionRepository.findById(
      assessmentQuestionId
    );

  if (!assessmentQuestion) {
    throw new ApiError(
      404,
      "Assessment Question not found."
    );
  }

  /**
   * Check Duplicate Mark Entry
   */
  const existingMark =
    await studentQuestionMarkRepository.findByStudentAndQuestion(
      studentId,
      assessmentQuestionId
    );

  if (existingMark) {
    throw new ApiError(
      409,
      "Marks already entered for this Student and Assessment Question."
    );
  }

  /**
   * Get Course Offering ID
   *
   * Assessment Question
   *        ↓
   * Assessment
   *        ↓
   * Course Offering
   */
  const courseOfferingId =
    assessmentQuestion.assessment?.courseOfferingId;

  if (!courseOfferingId) {
    throw new ApiError(
      400,
      "Course Offering could not be determined from Assessment Question."
    );
  }

  /**
   * Check Student Course Registration
   */
  const courseRegistration =
    await courseRegistrationRepository.findByStudentAndCourseOffering(
      studentId,
      courseOfferingId
    );

  if (!courseRegistration) {
    throw new ApiError(
      400,
      "Student is not registered for this Course Offering."
    );
  }

  /**
   * Validate Marks
   */
  if (isAbsent === true) {
    data.marksObtained = 0;
  } else {
    const obtainedMarks = Number(marksObtained);

    const maximumMarks = Number(
      assessmentQuestion.maxMarks
    );

    if (Number.isNaN(obtainedMarks)) {
      throw new ApiError(
        400,
        "Marks obtained must be a valid number."
      );
    }

    if (obtainedMarks < 0) {
      throw new ApiError(
        400,
        "Marks obtained cannot be negative."
      );
    }

    if (obtainedMarks > maximumMarks) {
      throw new ApiError(
        400,
        `Marks obtained cannot exceed question maximum marks of ${maximumMarks}.`
      );
    }
  }

  /**
   * Create Student Question Mark
   */
  const createdMark =
    await studentQuestionMarkRepository.createStudentQuestionMark(
      data
    );

  /**
   * Return Created Mark With Associations
   */
  return await studentQuestionMarkRepository.findStudentQuestionMarkById(
    createdMark.id
  );
};

/**
 * Get All Student Question Marks
 */
const getStudentQuestionMarks = async () => {
  return await studentQuestionMarkRepository.findAllStudentQuestionMarks();
};

/**
 * Get Student Question Mark By ID
 */
const getStudentQuestionMarkById = async (id) => {
  const studentQuestionMark =
    await studentQuestionMarkRepository.findStudentQuestionMarkById(
      id
    );

  if (!studentQuestionMark) {
    throw new ApiError(
      404,
      "Student Question Mark not found."
    );
  }

  return studentQuestionMark;
};

/**
 * Get Marks By Student
 */
const getMarksByStudentId = async (studentId) => {
  const student =
    await studentRepository.findStudentById(studentId);

  if (!student) {
    throw new ApiError(
      404,
      "Student not found."
    );
  }

  return await studentQuestionMarkRepository.findMarksByStudentId(
    studentId
  );
};

/**
 * Get Marks By Assessment Question
 */
const getMarksByAssessmentQuestionId = async (
  assessmentQuestionId
) => {
  const assessmentQuestion =
    await assessmentQuestionRepository.findById(
      assessmentQuestionId
    );

  if (!assessmentQuestion) {
    throw new ApiError(
      404,
      "Assessment Question not found."
    );
  }

  return await studentQuestionMarkRepository.findMarksByAssessmentQuestionId(
    assessmentQuestionId
  );
};

/**
 * Update Student Question Mark
 */
const updateStudentQuestionMark = async (
  id,
  data
) => {
  const studentQuestionMark =
    await studentQuestionMarkRepository.findStudentQuestionMarkById(
      id
    );

  if (!studentQuestionMark) {
    throw new ApiError(
      404,
      "Student Question Mark not found."
    );
  }

  const assessmentQuestion =
    studentQuestionMark.assessmentQuestion;

  if (!assessmentQuestion) {
    throw new ApiError(
      404,
      "Assessment Question not found."
    );
  }

  /**
   * Validate Updated Marks
   */
  if (data.isAbsent === true) {
    data.marksObtained = 0;
  } else if (
    data.marksObtained !== undefined
  ) {
    const obtainedMarks = Number(
      data.marksObtained
    );

    const maximumMarks = Number(
      assessmentQuestion.maxMarks
    );

    if (Number.isNaN(obtainedMarks)) {
      throw new ApiError(
        400,
        "Marks obtained must be a valid number."
      );
    }

    if (obtainedMarks < 0) {
      throw new ApiError(
        400,
        "Marks obtained cannot be negative."
      );
    }

    if (obtainedMarks > maximumMarks) {
      throw new ApiError(
        400,
        `Marks obtained cannot exceed question maximum marks of ${maximumMarks}.`
      );
    }
  }

  /**
   * Update Student Question Mark
   */
  return await studentQuestionMarkRepository.updateStudentQuestionMark(
    studentQuestionMark,
    data
  );
};

/**
 * Delete Student Question Mark
 */
const deleteStudentQuestionMark = async (id) => {
  const studentQuestionMark =
    await studentQuestionMarkRepository.findStudentQuestionMarkById(
      id
    );

  if (!studentQuestionMark) {
    throw new ApiError(
      404,
      "Student Question Mark not found."
    );
  }

  await studentQuestionMarkRepository.deleteStudentQuestionMark(
    studentQuestionMark
  );
};

export default {
  createStudentQuestionMark,
  getStudentQuestionMarks,
  getStudentQuestionMarkById,
  getMarksByStudentId,
  getMarksByAssessmentQuestionId,
  updateStudentQuestionMark,
  deleteStudentQuestionMark,
};