

import AssessmentQuestion from "../../database/models/AssessmentQuestion.js";
import Assessment from "../../database/models/Assessment.js";
import CourseOutcome from "../../database/models/CourseOutcome.js";
import CourseOffering from "../../database/models/CourseOffering.js";
import Course from "../../database/models/Course.js";

/**
 * Common Assessment Question associations
 */
const assessmentQuestionIncludes = [
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
    include: [
      {
        model: CourseOffering,
        as: "courseOffering",
        attributes: [
          "id",
          "courseId",
          "batchId",
          "semesterId",
          "facultyId",
          "section",
          "status",
        ],
        include: [
          {
            model: Course,
            as: "course",
            attributes: [
              "id",
              "name",
              "code",
              "credits",
              "semester",
              "programId",
              "status",
            ],
          },
        ],
      },
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
];

class AssessmentQuestionRepository {
  /**
   * Create Assessment Question
   */
  async create(data) {
    return AssessmentQuestion.create(data);
  }

  /**
   * Get All Assessment Questions
   */
  async findAll() {
    return AssessmentQuestion.findAll({
      include: assessmentQuestionIncludes,
      order: [
        ["assessmentId", "ASC"],
        ["questionNumber", "ASC"],
      ],
    });
  }

  /**
   * Get Assessment Question By ID
   */
  async findById(id) {
    return AssessmentQuestion.findByPk(id, {
      include: assessmentQuestionIncludes,
    });
  }

  /**
   * Find Question By Assessment and Question Number
   */
  async findByAssessmentAndQuestionNumber(
    assessmentId,
    questionNumber
  ) {
    return AssessmentQuestion.findOne({
      where: {
        assessmentId,
        questionNumber,
      },
    });
  }

  /**
   * Find Questions By Assessment
   */
  async findByAssessmentId(assessmentId) {
    return AssessmentQuestion.findAll({
      where: {
        assessmentId,
      },
      include: assessmentQuestionIncludes,
      order: [["questionNumber", "ASC"]],
    });
  }

  /**
   * Find Questions By Course Outcome
   */
  async findByCourseOutcomeId(courseOutcomeId) {
    return AssessmentQuestion.findAll({
      where: {
        courseOutcomeId,
      },
      include: assessmentQuestionIncludes,
      order: [["createdAt", "ASC"]],
    });
  }

  /**
   * Update Assessment Question
   */
  async update(id, data) {
    const assessmentQuestion =
      await AssessmentQuestion.findByPk(id);

    if (!assessmentQuestion) {
      return null;
    }

    await assessmentQuestion.update(data);

    return this.findById(id);
  }

  /**
   * Delete Assessment Question
   */
  async delete(id) {
    const assessmentQuestion =
      await AssessmentQuestion.findByPk(id);

    if (!assessmentQuestion) {
      return false;
    }

    await assessmentQuestion.destroy();

    return true;
  }
}

export default new AssessmentQuestionRepository();