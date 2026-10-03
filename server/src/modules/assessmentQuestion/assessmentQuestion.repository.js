/**
 * ------------------------------------------------------------------
 * Assessment Question Repository
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import AssessmentQuestion from "../../database/models/AssessmentQuestion.js";
import Assessment from "../../database/models/Assessment.js";
import CourseOutcome from "../../database/models/CourseOutcome.js";

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
  },
  {
    model: CourseOutcome,
    as: "courseOutcome",
    attributes: [
      "id",
      "code",
      "description",
      "status",
    ],
  },
];

class AssessmentQuestionRepository {
  /**
   * Create Question
   */
  async create(data) {
    return AssessmentQuestion.create(data);
  }

  /**
   * Get All Questions
   */
  async findAll() {
    return AssessmentQuestion.findAll({
      include: assessmentQuestionIncludes,
      order: [
        ["createdAt", "ASC"],
      ],
    });
  }

  /**
   * Get Question By ID
   */
  async findById(id) {
    return AssessmentQuestion.findByPk(id, {
      include: assessmentQuestionIncludes,
    });
  }

  /**
   * Get Questions By Assessment
   */
  async findByAssessmentId(assessmentId) {
    return AssessmentQuestion.findAll({
      where: {
        assessmentId,
      },
      include: [
        {
          model: CourseOutcome,
          as: "courseOutcome",
          attributes: [
            "id",
            "code",
            "description",
            "status",
          ],
        },
      ],
      order: [
        ["questionNumber", "ASC"],
      ],
    });
  }

  /**
   * Find Duplicate Question Number
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
   * Update Question
   */
  async update(id, data) {
    const question =
      await AssessmentQuestion.findByPk(id);

    if (!question) {
      return null;
    }

    await question.update(data);

    return this.findById(id);
  }

  /**
   * Delete Question
   */
  async delete(id) {
    const question =
      await AssessmentQuestion.findByPk(id);

    if (!question) {
      return false;
    }

    await question.destroy();

    return true;
  }
}

export default new AssessmentQuestionRepository();