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
import Assessment from "../../database/models/Assessment.js";
import AssessmentQuestion from "../../database/models/AssessmentQuestion.js";
import StudentQuestionMark from "../../database/models/StudentQuestionMark.js";
import StudentAssessmentMark from "../../database/models/StudentAssessmentMark.js";
import Student from "../../database/models/Student.js";
import ApiError from "../../shared/errors/ApiError.js";

const QUESTION_GROUPS = {
  part1: [1, 2],
  part2: [3, 4],
  part3: [5, 6],
};

/**
 * Extract the main question number.
 *
 * Examples:
 * Q1(a) -> 1
 * Q1(b) -> 1
 * Q1(c) -> 1
 * Q5    -> 5
 */
const getMainQuestionNumber = (questionNumber) => {
  const value = String(questionNumber ?? "").trim();

  const match = value.match(/^Q?\s*(\d+)/i);

  if (!match) {
    return null;
  }

  return Number(match[1]);
};

/**
 * Validate assessment and return it.
 */
const validateAssessment = async (assessmentId) => {
  const assessment = await Assessment.findByPk(assessmentId);

  if (!assessment) {
    throw new ApiError(404, "Assessment not found.");
  }

  if (assessment.status === false) {
    throw new ApiError(400, "Assessment is inactive.");
  }

  if (!assessment.courseOfferingId) {
    throw new ApiError(
      400,
      "Course Offering could not be determined from Assessment."
    );
  }

  return assessment;
};

/**
 * Validate student and course registration.
 */
const validateStudentForAssessment = async (studentId, assessment) => {
  const student = await studentRepository.findStudentById(studentId);

  if (!student) {
    throw new ApiError(404, "Student not found.");
  }

  const courseRegistration =
    await courseRegistrationRepository.findByStudentAndCourseOffering(
      studentId,
      assessment.courseOfferingId
    );

  if (!courseRegistration) {
    throw new ApiError(
      400,
      "Student is not registered for this Course Offering."
    );
  }

  return student;
};

/**
 * Create one Student Question Mark.
 */
const createStudentQuestionMark = async (data) => {
  const { studentId, assessmentQuestionId } = data;

  let { marksObtained, isAbsent = false, isAttempted = false } = data;

  const student = await studentRepository.findStudentById(studentId);

  if (!student) {
    throw new ApiError(404, "Student not found.");
  }

  const assessmentQuestion =
    await assessmentQuestionRepository.findById(assessmentQuestionId);

  if (!assessmentQuestion) {
    throw new ApiError(404, "Assessment Question not found.");
  }

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

  const courseOfferingId = assessmentQuestion.assessment?.courseOfferingId;

  if (!courseOfferingId) {
    throw new ApiError(
      400,
      "Course Offering could not be determined from Assessment Question."
    );
  }

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
   * Absent student:
   * marks = 0
   * attempted = false
   */
  if (isAbsent === true) {
    marksObtained = 0;
    isAttempted = false;
  }

  /**
   * Not attempted:
   * marks must be 0.
   */
  if (isAttempted === false) {
    marksObtained = 0;
  }

  if (isAttempted === true && isAbsent === true) {
    throw new ApiError(
      400,
      "An absent student cannot have an attempted question."
    );
  }

  const obtainedMarks = Number(marksObtained);
  const maximumMarks = Number(assessmentQuestion.maxMarks);

  if (Number.isNaN(obtainedMarks)) {
    throw new ApiError(400, "Marks obtained must be a valid number.");
  }

  if (obtainedMarks < 0) {
    throw new ApiError(400, "Marks obtained cannot be negative.");
  }

  if (obtainedMarks > maximumMarks) {
    throw new ApiError(
      400,
      `Marks obtained cannot exceed question maximum marks of ${maximumMarks}.`
    );
  }

  const createdMark =
    await studentQuestionMarkRepository.createStudentQuestionMark({
      studentId,
      assessmentQuestionId,
      marksObtained: obtainedMarks,
      isAbsent,
      isAttempted,
      status: data.status === undefined ? true : Boolean(data.status),
    });

  return await studentQuestionMarkRepository.findStudentQuestionMarkById(
    createdMark.id
  );
};

/**
 * Get all marks.
 */
const getStudentQuestionMarks = async () => {
  return await studentQuestionMarkRepository.findAllStudentQuestionMarks();
};

/**
 * Get mark by ID.
 */
const getStudentQuestionMarkById = async (id) => {
  const studentQuestionMark =
    await studentQuestionMarkRepository.findStudentQuestionMarkById(id);

  if (!studentQuestionMark) {
    throw new ApiError(404, "Student Question Mark not found.");
  }

  return studentQuestionMark;
};

/**
 * Get marks by student.
 */
const getMarksByStudentId = async (studentId) => {
  const student = await studentRepository.findStudentById(studentId);

  if (!student) {
    throw new ApiError(404, "Student not found.");
  }

  return await studentQuestionMarkRepository.findMarksByStudentId(studentId);
};

/**
 * Get marks by assessment question.
 */
const getMarksByAssessmentQuestionId = async (assessmentQuestionId) => {
  const assessmentQuestion =
    await assessmentQuestionRepository.findById(assessmentQuestionId);

  if (!assessmentQuestion) {
    throw new ApiError(404, "Assessment Question not found.");
  }

  return await studentQuestionMarkRepository.findMarksByAssessmentQuestionId(
    assessmentQuestionId
  );
};

/**
 * Get all saved marks for one student in one assessment (Question-Wise).
 */
const getMarksByAssessmentAndStudent = async (assessmentId, studentId) => {
  const assessment = await validateAssessment(assessmentId);

  await validateStudentForAssessment(studentId, assessment);

  return await studentQuestionMarkRepository.findMarksByStudentAndAssessment(
    studentId,
    assessmentId
  );
};

/**
 * ================================================================
 * GET ALL MARKS FOR AN ENTIRE ASSESSMENT (MASTER LEDGER TABLE)
 * ================================================================
 */
const getMarksByAssessment = async (assessmentId) => {
  await validateAssessment(assessmentId);

  const marks = await StudentQuestionMark.findAll({
    include: [
      {
        model: AssessmentQuestion,
        as: "assessmentQuestion",
        where: { assessmentId },
        attributes: [
          "id",
          "questionNumber",
          "maxMarks",
          "assessmentId",
          "courseOutcomeId",
        ],
      },
      {
        model: Student,
        as: "student",
        attributes: ["id", "usn", "firstName", "lastName"],
      },
    ],
    order: [["createdAt", "ASC"]],
  });

  return marks;
};

/**
 * Save all marks for one student in one assessment (Question-Wise).
 *
 * This is the main Marks Entry operation for CIE/IA.
 */
const saveBulkStudentMarks = async (assessmentId, studentId, data) => {
  const assessment = await validateAssessment(assessmentId);

  await validateStudentForAssessment(studentId, assessment);

  const { selectedQuestions, marks } = data;

  /**
   * ------------------------------------------------------------
   * Load all active questions for this assessment.
   * ------------------------------------------------------------
   */
  const assessmentQuestions =
    await assessmentQuestionRepository.findByAssessmentId(assessmentId);

  const activeQuestions = assessmentQuestions.filter(
    (question) => question.status !== false
  );

  if (activeQuestions.length === 0) {
    throw new ApiError(400, "No active assessment questions are available.");
  }

  /**
   * ------------------------------------------------------------
   * Determine selected main questions.
   * ------------------------------------------------------------
   */
  const selectedMainQuestions = [
    selectedQuestions.part1,
    selectedQuestions.part2,
    selectedQuestions.part3,
  ];

  const selectedMainQuestionSet = new Set(selectedMainQuestions);

  /**
   * ------------------------------------------------------------
   * Build expected selected question list.
   * ------------------------------------------------------------
   */
  const expectedQuestions = activeQuestions.filter((question) => {
    const mainNumber = getMainQuestionNumber(question.questionNumber);
    return selectedMainQuestionSet.has(mainNumber);
  });

  /**
   * Verify every selected main question actually exists.
   */
  for (const mainQuestion of selectedMainQuestions) {
    const matchingQuestions = activeQuestions.filter(
      (question) =>
        getMainQuestionNumber(question.questionNumber) === mainQuestion
    );

    if (matchingQuestions.length === 0) {
      throw new ApiError(
        400,
        `Selected question Q${mainQuestion} does not exist in this Assessment.`
      );
    }
  }

  /**
   * ------------------------------------------------------------
   * Candidate paper maximum check.
   * ------------------------------------------------------------
   */
  const selectedMaximumMarks = expectedQuestions.reduce(
    (total, question) => total + Number(question.maxMarks),
    0
  );

  if (selectedMaximumMarks !== Number(assessment.maxMarks)) {
    throw new ApiError(
      400,
      `Selected questions total ${selectedMaximumMarks} marks, but this assessment is ${assessment.maxMarks} marks.`
    );
  }

  /**
   * ------------------------------------------------------------
   * Validate marks array.
   * ------------------------------------------------------------
   */
  const expectedQuestionIds = expectedQuestions.map((question) => question.id);
  const expectedQuestionIdSet = new Set(expectedQuestionIds);

  const suppliedQuestionIds = marks.map((mark) => mark.assessmentQuestionId);
  const suppliedQuestionIdSet = new Set(suppliedQuestionIds);

  /**
   * Duplicate question IDs are not allowed.
   */
  if (suppliedQuestionIds.length !== suppliedQuestionIdSet.size) {
    throw new ApiError(
      400,
      "Duplicate assessment questions were supplied in the marks entry."
    );
  }

  /**
   * Every selected question must have a marks entry.
   */
  for (const questionId of expectedQuestionIds) {
    if (!suppliedQuestionIdSet.has(questionId)) {
      const question = expectedQuestions.find((item) => item.id === questionId);

      throw new ApiError(
        400,
        `Marks are missing for ${question.questionNumber}.`
      );
    }
  }

  /**
   * No alternative question may be supplied.
   */
  for (const suppliedId of suppliedQuestionIds) {
    if (!expectedQuestionIdSet.has(suppliedId)) {
      const suppliedQuestion = activeQuestions.find(
        (question) => question.id === suppliedId
      );

      if (!suppliedQuestion) {
        throw new ApiError(
          400,
          "One or more supplied assessment questions do not belong to this Assessment."
        );
      }

      throw new ApiError(
        400,
        `${suppliedQuestion.questionNumber} is not part of the selected OR questions.`
      );
    }
  }

  /**
   * ------------------------------------------------------------
   * Validate each mark.
   * ------------------------------------------------------------
   */
  const records = [];
  let totalObtainedMarks = 0;

  for (const mark of marks) {
    const question = activeQuestions.find(
      (item) => item.id === mark.assessmentQuestionId
    );

    if (!question) {
      throw new ApiError(
        400,
        "Assessment Question does not belong to this Assessment."
      );
    }

    let marksObtained = Number(mark.marksObtained);
    let isAbsent = Boolean(mark.isAbsent);
    let isAttempted = Boolean(mark.isAttempted);

    if (isAbsent) {
      marksObtained = 0;
      isAttempted = false;
    }

    if (!isAttempted) {
      marksObtained = 0;
    }

    if (isAbsent && isAttempted) {
      throw new ApiError(
        400,
        `${question.questionNumber}: an absent question cannot be attempted.`
      );
    }

    if (Number.isNaN(marksObtained)) {
      throw new ApiError(
        400,
        `${question.questionNumber}: marks obtained must be a valid number.`
      );
    }

    if (marksObtained < 0) {
      throw new ApiError(
        400,
        `${question.questionNumber}: marks cannot be negative.`
      );
    }

    const questionMaximum = Number(question.maxMarks);

    if (marksObtained > questionMaximum) {
      throw new ApiError(
        400,
        `${question.questionNumber}: marks cannot exceed ${questionMaximum}.`
      );
    }

    totalObtainedMarks += marksObtained;

    records.push({
      studentId,
      assessmentQuestionId: question.id,
      marksObtained,
      isAbsent,
      isAttempted,
      status: true,
    });
  }

  if (totalObtainedMarks > Number(assessment.maxMarks)) {
    throw new ApiError(
      400,
      `Total obtained marks (${totalObtainedMarks}) cannot exceed assessment maximum marks (${assessment.maxMarks}).`
    );
  }

  /**
   * ------------------------------------------------------------
   * Transaction
   * ------------------------------------------------------------
   */
  const transaction = await Assessment.sequelize.transaction();

  try {
    await studentQuestionMarkRepository.deleteMarksByQuestionIds(
      studentId,
      expectedQuestionIds,
      transaction
    );

    const createdMarks =
      await studentQuestionMarkRepository.bulkCreateStudentQuestionMarks(
        records,
        transaction
      );

    await transaction.commit();

    const savedMarks =
      await studentQuestionMarkRepository.findMarksByStudentAndAssessment(
        studentId,
        assessmentId
      );

    return {
      assessmentId,
      assessmentName: assessment.name,
      assessmentMaxMarks: Number(assessment.maxMarks),
      studentId,
      selectedQuestions,
      selectedQuestionMaximum: selectedMaximumMarks,
      totalObtainedMarks,
      totalQuestions: createdMarks.length,
      marks: savedMarks,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Update one Student Question Mark.
 */
const updateStudentQuestionMark = async (id, data) => {
  const studentQuestionMark =
    await studentQuestionMarkRepository.findStudentQuestionMarkById(id);

  if (!studentQuestionMark) {
    throw new ApiError(404, "Student Question Mark not found.");
  }

  const assessmentQuestion = studentQuestionMark.assessmentQuestion;

  if (!assessmentQuestion) {
    throw new ApiError(404, "Assessment Question not found.");
  }

  let marksObtained =
    data.marksObtained !== undefined
      ? Number(data.marksObtained)
      : Number(studentQuestionMark.marksObtained);

  let isAbsent =
    data.isAbsent !== undefined
      ? Boolean(data.isAbsent)
      : Boolean(studentQuestionMark.isAbsent);

  let isAttempted =
    data.isAttempted !== undefined
      ? Boolean(data.isAttempted)
      : Boolean(studentQuestionMark.isAttempted);

  if (isAbsent) {
    marksObtained = 0;
    isAttempted = false;
  }

  if (!isAttempted) {
    marksObtained = 0;
  }

  if (isAbsent && isAttempted) {
    throw new ApiError(400, "An absent question cannot be attempted.");
  }

  const maximumMarks = Number(assessmentQuestion.maxMarks);

  if (Number.isNaN(marksObtained)) {
    throw new ApiError(400, "Marks obtained must be a valid number.");
  }

  if (marksObtained < 0) {
    throw new ApiError(400, "Marks obtained cannot be negative.");
  }

  if (marksObtained > maximumMarks) {
    throw new ApiError(
      400,
      `Marks obtained cannot exceed question maximum marks of ${maximumMarks}.`
    );
  }

  return await studentQuestionMarkRepository.updateStudentQuestionMark(
    studentQuestionMark,
    {
      ...data,
      marksObtained,
      isAbsent,
      isAttempted,
    }
  );
};

/**
 * Delete one Student Question Mark.
 */
const deleteStudentQuestionMark = async (id) => {
  const studentQuestionMark =
    await studentQuestionMarkRepository.findStudentQuestionMarkById(id);

  if (!studentQuestionMark) {
    throw new ApiError(404, "Student Question Mark not found.");
  }

  await studentQuestionMarkRepository.deleteStudentQuestionMark(
    studentQuestionMark
  );
};

// ================================================================
// DIRECT / OVERALL MARKS METHODS (Quiz, Assignment, Lab, SEE, Project)
// ================================================================

/**
 * Get all direct marks for an assessment
 */
const getDirectMarksByAssessment = async (assessmentId) => {
  await validateAssessment(assessmentId);

  const marks = await StudentAssessmentMark.findAll({
    where: { assessmentId },
    include: [
      {
        model: Student,
        as: "student",
        attributes: ["id", "usn", "firstName", "lastName"],
      },
    ],
    order: [[{ model: Student, as: "student" }, "usn", "ASC"]],
  });

  return marks;
};

/**
 * Bulk upsert direct marks for an assessment
 */
const saveBulkDirectMarks = async (assessmentId, marksList) => {
  const assessment = await validateAssessment(assessmentId);

  if (!Array.isArray(marksList) || marksList.length === 0) {
    throw new ApiError(400, "Marks payload must be a non-empty array.");
  }

  const maxMarks = Number(assessment.maxMarks);
  const transaction = await Assessment.sequelize.transaction();

  try {
    for (const record of marksList) {
      const isAbsent = Boolean(record.isAbsent);
      let numVal = isAbsent ? 0 : Number(record.marksObtained);

      if (
        !isAbsent &&
        (isNaN(numVal) ||
          record.marksObtained === "" ||
          record.marksObtained === null)
      ) {
        numVal = null;
      }

      if (numVal !== null && numVal > maxMarks) {
        throw new ApiError(
          400,
          `Marks obtained (${numVal}) cannot exceed assessment maximum marks (${maxMarks}).`
        );
      }

      const existing = await StudentAssessmentMark.findOne({
        where: {
          assessmentId,
          studentId: record.studentId,
        },
        transaction,
      });

      if (existing) {
        await existing.update(
          {
            marksObtained: numVal,
            isAbsent,
          },
          { transaction }
        );
      } else {
        await StudentAssessmentMark.create(
          {
            assessmentId,
            studentId: record.studentId,
            marksObtained: numVal,
            isAbsent,
          },
          { transaction }
        );
      }
    }

    await transaction.commit();

    return {
      assessmentId,
      totalSaved: marksList.length,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export default {
  createStudentQuestionMark,
  getStudentQuestionMarks,
  getStudentQuestionMarkById,
  getMarksByStudentId,
  getMarksByAssessmentQuestionId,
  getMarksByAssessment, // <-- Exported here
  getMarksByAssessmentAndStudent,
  saveBulkStudentMarks,
  updateStudentQuestionMark,
  deleteStudentQuestionMark,

  // Direct Marks exports
  getDirectMarksByAssessment,
  saveBulkDirectMarks,
};