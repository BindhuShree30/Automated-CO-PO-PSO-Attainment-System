/**
 * ------------------------------------------------------------------
 * Assessment Repository
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 * Handles Assessment database operations.
 * ------------------------------------------------------------------
 */

import Assessment from "../../database/models/Assessment.js";
import CourseOffering from "../../database/models/CourseOffering.js";
import Course from "../../database/models/Course.js";
import Batch from "../../database/models/Batch.js";
import Semester from "../../database/models/Semester.js";
import AcademicYear from "../../database/models/AcademicYear.js";
import Faculty from "../../database/models/Faculty.js";

/**
 * Common Assessment associations
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

class AssessmentRepository {
  /**
   * Create Assessment
   */
  async create(data) {
    return Assessment.create(data);
  }

  /**
   * Get All Assessments
   */
  async findAll() {
    return Assessment.findAll({
      include: assessmentIncludes,
      order: [["assessmentDate", "DESC"]],
    });
  }

  /**
   * Get Assessment By ID
   */
  async findById(id) {
    return Assessment.findByPk(id, {
      include: assessmentIncludes,
    });
  }

  /**
   * Find Assessment By Name and Course Offering
   */
  async findByNameAndCourseOffering(
    name,
    courseOfferingId
  ) {
    return Assessment.findOne({
      where: {
        name,
        courseOfferingId,
      },
    });
  }

  /**
   * Find Assessments By Course Offering
   */
  async findByCourseOfferingId(courseOfferingId) {
    return Assessment.findAll({
      where: {
        courseOfferingId,
      },
      include: assessmentIncludes,
      order: [["assessmentDate", "ASC"]],
    });
  }

  /**
   * Update Assessment
   */
  async update(id, data) {
    const assessment = await Assessment.findByPk(id);

    if (!assessment) {
      return null;
    }

    await assessment.update(data);

    return this.findById(id);
  }

  /**
   * Delete Assessment
   */
  async delete(id) {
    const assessment = await Assessment.findByPk(id);

    if (!assessment) {
      return false;
    }

    await assessment.destroy();

    return true;
  }
}

export default new AssessmentRepository();