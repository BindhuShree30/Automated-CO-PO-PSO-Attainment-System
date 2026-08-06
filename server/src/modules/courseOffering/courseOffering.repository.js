/**
 * ------------------------------------------------------------------
 * Course Offering Repository
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import CourseOffering from "../../database/models/CourseOffering.js";
import Course from "../../database/models/Course.js";
import Batch from "../../database/models/Batch.js";
import Semester from "../../database/models/Semester.js";
import Faculty from "../../database/models/Faculty.js";
import Program from "../../database/models/Program.js";
import AcademicYear from "../../database/models/AcademicYear.js";

class CourseOfferingRepository {
  /**
   * Create Course Offering
   */
  async create(data) {
    return CourseOffering.create(data);
  }

  /**
   * Get All Course Offerings
   */
  async findAll() {
    return CourseOffering.findAll({
      include: [
        {
          model: Course,
          as: "course",
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
          ],
          include: [
            {
              model: Program,
              as: "program",
              attributes: [
                "id",
                "name",
                "code",
                "duration",
              ],
            },
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
        },
      ],
      order: [
        ["createdAt", "DESC"],
      ],
    });
  }

  /**
   * Get Course Offering By ID
   */
  async findById(id) {
    return CourseOffering.findByPk(id, {
      include: [
        {
          model: Course,
          as: "course",
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
          ],
          include: [
            {
              model: Program,
              as: "program",
              attributes: [
                "id",
                "name",
                "code",
                "duration",
              ],
            },
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
        },
      ],
    });
  }

  /**
   * Find Duplicate Course Offering
   */
  async findDuplicate(
    courseId,
    batchId,
    semesterId,
    section
  ) {
    return CourseOffering.findOne({
      where: {
        courseId,
        batchId,
        semesterId,
        section,
      },
    });
  }

  /**
   * Update Course Offering
   */
  async update(id, data) {
    const courseOffering =
      await CourseOffering.findByPk(id);

    if (!courseOffering) {
      return null;
    }

    return courseOffering.update(data);
  }

  /**
   * Delete Course Offering
   */
  async delete(id) {
    const courseOffering =
      await CourseOffering.findByPk(id);

    if (!courseOffering) {
      return null;
    }

    await courseOffering.destroy();

    return true;
  }
}

export default new CourseOfferingRepository();