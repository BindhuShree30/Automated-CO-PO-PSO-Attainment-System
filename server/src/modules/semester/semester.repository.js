/**
 * ------------------------------------------------------------------
 * Semester Repository
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import Semester from "../../database/models/Semester.js";
import Batch from "../../database/models/Batch.js";
import AcademicYear from "../../database/models/AcademicYear.js";
import Program from "../../database/models/Program.js";

class SemesterRepository {
  /**
   * Create Semester
   */
  async create(data) {
    return Semester.create(data);
  }

  /**
   * Get All Semesters
   */
  async findAll() {
    return Semester.findAll({
      include: [
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
              attributes: ["id", "name", "code", "duration"],
            },
          ],
        },
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
      order: [
        ["semesterNumber", "ASC"],
      ],
    });
  }

  /**
   * Get Semester By ID
   */
  async findById(id) {
    return Semester.findByPk(id, {
      include: [
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
              attributes: ["id", "name", "code", "duration"],
            },
          ],
        },
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
    });
  }

  /**
   * Find Semester By Batch And Semester Number
   */
  async findByBatchAndSemesterNumber(
    batchId,
    semesterNumber
  ) {
    return Semester.findOne({
      where: {
        batchId,
        semesterNumber,
      },
    });
  }

  /**
   * Update Semester
   */
  async update(id, data) {
    const semester = await Semester.findByPk(id);

    if (!semester) {
      return null;
    }

    return semester.update(data);
  }

  /**
   * Delete Semester
   */
  async delete(id) {
    const semester = await Semester.findByPk(id);

    if (!semester) {
      return null;
    }

    await semester.destroy();

    return true;
  }
}

export default new SemesterRepository();