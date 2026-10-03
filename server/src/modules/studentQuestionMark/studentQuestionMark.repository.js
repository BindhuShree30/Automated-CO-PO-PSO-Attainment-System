import StudentQuestionMark from "../../database/models/StudentQuestionMark.js";
import Student from "../../database/models/Student.js";
import AssessmentQuestion from "../../database/models/AssessmentQuestion.js";
import Assessment from "../../database/models/Assessment.js";
import CourseOutcome from "../../database/models/CourseOutcome.js";

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

const createStudentQuestionMark = async (data, transaction = null) => {
  return await StudentQuestionMark.create(data, {
    transaction,
  });
};

const bulkCreateStudentQuestionMarks = async (
  data,
  transaction = null
) => {
  return await StudentQuestionMark.bulkCreate(data, {
    transaction,
  });
};

const findStudentQuestionMarkById = async (id) => {
  return await StudentQuestionMark.findByPk(id, {
    include: studentQuestionMarkIncludes,
  });
};

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
 * Find Marks By Assessment ID
 * Filters strictly by assessmentId for the Master Ledger & avoids column sort crashes
 */
const findMarksByAssessment = async (assessmentId) => {
  return await StudentQuestionMark.findAll({
    include: [
      {
        model: Student,
        as: "student",
      },
      {
        model: AssessmentQuestion,
        as: "assessmentQuestion",
        where: assessmentId ? { assessmentId } : undefined,
        required: true,
        include: [
          {
            model: CourseOutcome,
            as: "courseOutcome",
          },
          {
            model: Assessment,
            as: "assessment",
          },
        ],
      },
    ],
    order: [["id", "ASC"]],
  });
};

const findAllStudentQuestionMarks = async (filter = {}) => {
  const where = {};
  if (filter.studentId) where.studentId = filter.studentId;
  if (filter.assessmentQuestionId) where.assessmentQuestionId = filter.assessmentQuestionId;

  return await StudentQuestionMark.findAll({
    where,
    include: [
      {
        model: Student,
        as: "student",
      },
      {
        model: AssessmentQuestion,
        as: "assessmentQuestion",
        where: filter.assessmentId ? { assessmentId: filter.assessmentId } : undefined,
        required: Boolean(filter.assessmentId),
        include: [
          {
            model: Assessment,
            as: "assessment",
          },
          {
            model: CourseOutcome,
            as: "courseOutcome",
          },
        ],
      },
    ],
    order: [["id", "ASC"]],
  });
};

const findMarksByStudentId = async (studentId) => {
  return await StudentQuestionMark.findAll({
    where: { studentId },
    include: studentQuestionMarkIncludes,
    order: [["id", "ASC"]],
  });
};

const findMarksByAssessmentQuestionId = async (
  assessmentQuestionId
) => {
  return await StudentQuestionMark.findAll({
    where: { assessmentQuestionId },
    include: studentQuestionMarkIncludes,
    order: [["id", "ASC"]],
  });
};

const findMarksByStudentAndAssessment = async (
  studentId,
  assessmentId
) => {
  return await StudentQuestionMark.findAll({
    where: {
      studentId,
    },
    include: [
      {
        model: AssessmentQuestion,
        as: "assessmentQuestion",
        required: true,
        where: {
          assessmentId,
        },
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
    ],
    order: [["id", "ASC"]],
  });
};

const deleteMarksByQuestionIds = async (
  studentId,
  assessmentQuestionIds,
  transaction = null
) => {
  return await StudentQuestionMark.destroy({
    where: {
      studentId,
      assessmentQuestionId: assessmentQuestionIds,
    },
    transaction,
  });
};

const updateStudentQuestionMark = async (
  studentQuestionMark,
  data
) => {
  await studentQuestionMark.update(data);
  return await findStudentQuestionMarkById(studentQuestionMark.id);
};

const deleteStudentQuestionMark = async (
  studentQuestionMark
) => {
  return await studentQuestionMark.destroy();
};

export default {
  createStudentQuestionMark,
  bulkCreateStudentQuestionMarks,
  findStudentQuestionMarkById,
  findByStudentAndQuestion,
  findMarksByAssessment,
  findAllStudentQuestionMarks,
  findMarksByStudentId,
  findMarksByAssessmentQuestionId,
  findMarksByStudentAndAssessment,
  deleteMarksByQuestionIds,
  updateStudentQuestionMark,
  deleteStudentQuestionMark,
};