/**
 * ------------------------------------------------------------------
 * Student Question Mark Repository
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import StudentQuestionMark from "../../database/models/StudentQuestionMark.js";
import Student from "../../database/models/Student.js";
import AssessmentQuestion from "../../database/models/AssessmentQuestion.js";
import Assessment from "../../database/models/Assessment.js";
import CourseOutcome from "../../database/models/CourseOutcome.js";

/**
 * Common Includes
 */
const studentQuestionMarkIncludes = [
  {
    model: Student,
    as: "student",
    attributes: [
      "id",
      "usn",
      "firstName",
      "lastName",
      "email",
      "programId",
      "status",
    ],
  },
  {
    model: AssessmentQuestion,
    as: "assessmentQuestion",
    attributes: [
      "id",
      "assessmentId",
      "courseOutcomeId",
      "questionNumber",
      "description",
      "maxMarks",
      "status",
    ],
    include: [
      {
        model: Assessment,
        as: "assessment",
        attributes: [
          "id",
          "name",
          "type",
          "courseOfferingId",
          "maxMarks",
          "weightage",
          "assessmentDate",
          "status",
        ],
      },
      {
        model: CourseOutcome,
        as: "courseOutcome",
        attributes: [
          "id",
          "code",
          "description",
          "courseId",
          "status",
        ],
      },
    ],
  },
];

/**
 * Create Student Question Mark
 */
const createStudentQuestionMark = async (data) => {
  return await StudentQuestionMark.create(data);
};

/**
 * Find Student Question Mark By ID
 */
const findStudentQuestionMarkById = async (id) => {
  return await StudentQuestionMark.findByPk(id, {
    include: studentQuestionMarkIncludes,
  });
};

/**
 * Find Existing Student Question Mark
 */
const findByStudentAndQuestion = async (
  studentId,
  assessmentQuestionId
) => {
  return await StudentQuestionMark.findOne({
    where: {
      studentId,
      assessmentQuestionId,
    },
  });
};

/**
 * Find All Student Question Marks
 */
const findAllStudentQuestionMarks = async () => {
  return await StudentQuestionMark.findAll({
    include: studentQuestionMarkIncludes,
    order: [["createdAt", "ASC"]],
  });
};

/**
 * Find Marks By Student
 */
const findMarksByStudentId = async (studentId) => {
  return await StudentQuestionMark.findAll({
    where: {
      studentId,
    },
    include: studentQuestionMarkIncludes,
    order: [["createdAt", "ASC"]],
  });
};

/**
 * Find Marks By Assessment Question
 */
const findMarksByAssessmentQuestionId = async (
  assessmentQuestionId
) => {
  return await StudentQuestionMark.findAll({
    where: {
      assessmentQuestionId,
    },
    include: studentQuestionMarkIncludes,
    order: [["createdAt", "ASC"]],
  });
};

/**
 * Update Student Question Mark
 */
const updateStudentQuestionMark = async (
  studentQuestionMark,
  data
) => {
  await studentQuestionMark.update(data);

  return await findStudentQuestionMarkById(
    studentQuestionMark.id
  );
};

/**
 * Delete Student Question Mark
 */
const deleteStudentQuestionMark = async (
  studentQuestionMark
) => {
  return await studentQuestionMark.destroy();
};

export default {
  createStudentQuestionMark,
  findStudentQuestionMarkById,
  findByStudentAndQuestion,
  findAllStudentQuestionMarks,
  findMarksByStudentId,
  findMarksByAssessmentQuestionId,
  updateStudentQuestionMark,
  deleteStudentQuestionMark,
};