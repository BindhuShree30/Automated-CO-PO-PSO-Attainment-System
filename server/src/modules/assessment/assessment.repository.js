/**
 * ------------------------------------------------------------------
 * Assessment Repository
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 * Handles Assessment database operations.
 * ------------------------------------------------------------------
 */

import { Op } from "sequelize";
import sequelize from "../../database/connection.js";

import Assessment from "../../database/models/Assessment.js";
import AssessmentQuestion from "../../database/models/AssessmentQuestion.js";
import StudentQuestionMark from "../../database/models/StudentQuestionMark.js";

import CourseOffering from "../../database/models/CourseOffering.js";
import Course from "../../database/models/Course.js";
import Batch from "../../database/models/Batch.js";
import Semester from "../../database/models/Semester.js";
import AcademicYear from "../../database/models/AcademicYear.js";
import Faculty from "../../database/models/Faculty.js";

/**
 * ------------------------------------------------------------------
 * Assessment Includes
 * ------------------------------------------------------------------
 */
const assessmentIncludes = [
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
      },
      {
        model: Semester,
        as: "semester",
        attributes: [
          "id",
          "semesterNumber",
          "term",
          "academicYearId",
          "isCurrent",
          "status",
        ],
        include: [
          {
            model: AcademicYear,
            as: "academicYear",
            attributes: [
              "id",
              "name",
              "startYear",
              "endYear",
              "isCurrent",
            ],
          },
        ],
      },
      {
        model: Faculty,
        as: "faculty",
        attributes: [
          "id",
          "firstName",
          "lastName",
          "employeeId",
          "designation",
          "departmentId",
          "status",
        ],
      },
    ],
  },
];

/**
 * ------------------------------------------------------------------
 * Assessment Repository
 * ------------------------------------------------------------------
 */
class AssessmentRepository {
  /**
   * Create Assessment
   */
  async create(data, options = {}) {
    return Assessment.create(data, options);
  }

  /**
   * Get All Assessments
   */
  async findAll(options = {}) {
    return Assessment.findAll({
      include: assessmentIncludes,
      order: [["assessmentDate", "DESC"]],
      ...options,
    });
  }

  /**
   * Get Assessment By ID
   */
  async findById(id, options = {}) {
    return Assessment.findByPk(id, {
      include: assessmentIncludes,
      ...options,
    });
  }

  /**
   * Find Assessment By Name And Course Offering
   */
  async findByNameAndCourseOffering(name, courseOfferingId, options = {}) {
    return Assessment.findOne({
      where: {
        name,
        courseOfferingId,
      },
      ...options,
    });
  }

  /**
   * Find Assessments By Course Offering
   */
  async findByCourseOfferingId(courseOfferingId, options = {}) {
    return Assessment.findAll({
      where: {
        courseOfferingId,
      },
      include: assessmentIncludes,
      order: [["assessmentDate", "ASC"]],
      ...options,
    });
  }

  /**
   * Update Assessment
   */
  async update(id, data, options = {}) {
    const assessment = await Assessment.findByPk(id, options);

    if (!assessment) {
      return null;
    }

    await assessment.update(data, options);
    return this.findById(id, options);
  }

  /**
   * Cascading Delete for Assessment, Questions, and Marks
   */
  async delete(id) {
    const transaction = await sequelize.transaction();

    try {
      const assessment = await Assessment.findByPk(id, { transaction });
      if (!assessment) {
        await transaction.rollback();
        return false;
      }

      // 1. Fetch related question IDs
      const questions = await AssessmentQuestion.findAll({
        where: { assessmentId: id },
        attributes: ["id"],
        transaction,
      });

      const questionIds = questions.map((q) => q.id);

      // 2. Delete Student Question Marks if any questions exist
      if (questionIds.length > 0) {
        await StudentQuestionMark.destroy({
          where: {
            assessmentQuestionId: {
              [Op.in]: questionIds,
            },
          },
          transaction,
        });
      }

      // 3. Delete Assessment Questions
      await AssessmentQuestion.destroy({
        where: { assessmentId: id },
        transaction,
      });

      // 4. Delete Assessment
      await assessment.destroy({ transaction });

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default new AssessmentRepository();