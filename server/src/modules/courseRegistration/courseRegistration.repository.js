/**
 * ------------------------------------------------------------------
 * Course Registration Repository
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 * Handles Course Registration database operations.
 * ------------------------------------------------------------------
 */

import CourseRegistration from "../../database/models/CourseRegistration.js";
import Student from "../../database/models/Student.js";
import CourseOffering from "../../database/models/CourseOffering.js";
import Course from "../../database/models/Course.js";
import Batch from "../../database/models/Batch.js";
import Semester from "../../database/models/Semester.js";
import AcademicYear from "../../database/models/AcademicYear.js";
import Faculty from "../../database/models/Faculty.js";

/**
 * Common Course Registration associations
 */
const courseRegistrationIncludes = [
  {
    model: Student,
    as: "student",
    attributes: [
      "id",
      "usn",
      "firstName",
      "lastName",
      "email",
      "phone",
      "programId",
      "status",
    ],
  },
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

class CourseRegistrationRepository {
  /**
   * Create Course Registration
   */
  async create(data) {
    return CourseRegistration.create(data);
  }

  /**
   * Get All Course Registrations
   */
  async findAll() {
    return CourseRegistration.findAll({
      include: courseRegistrationIncludes,
      order: [["createdAt", "DESC"]],
    });
  }

  /**
   * Get Course Registration By ID
   */
  async findById(id) {
    return CourseRegistration.findByPk(id, {
      include: courseRegistrationIncludes,
    });
  }

  /**
   * Find Registration By Student and Course Offering
   */
  async findByStudentAndCourseOffering(
    studentId,
    courseOfferingId
  ) {
    return CourseRegistration.findOne({
      where: {
        studentId,
        courseOfferingId,
      },
    });
  }

  /**
   * Find Registrations By Student
   */
  async findByStudentId(studentId) {
    return CourseRegistration.findAll({
      where: {
        studentId,
      },
      include: courseRegistrationIncludes,
      order: [["registrationDate", "DESC"]],
    });
  }

  /**
   * Find Registrations By Course Offering
   */
  async findByCourseOfferingId(courseOfferingId) {
    return CourseRegistration.findAll({
      where: {
        courseOfferingId,
      },
      include: courseRegistrationIncludes,
      order: [["createdAt", "DESC"]],
    });
  }

  /**
   * Update Course Registration
   */
  async update(id, data) {
    const courseRegistration =
      await CourseRegistration.findByPk(id);

    if (!courseRegistration) {
      return null;
    }

    await courseRegistration.update(data);

    return this.findById(id);
  }

  /**
   * Delete Course Registration
   */
  async delete(id) {
    const courseRegistration =
      await CourseRegistration.findByPk(id);

    if (!courseRegistration) {
      return false;
    }

    await courseRegistration.destroy();

    return true;
  }
}

export default new CourseRegistrationRepository();