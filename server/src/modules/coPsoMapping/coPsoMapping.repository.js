/**
 * ------------------------------------------------------------------
 * CO–PSO Mapping Repository
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import {
  CoPsoMapping,
  CourseOutcome,
  ProgramSpecificOutcome,
  Course,
} from "../../database/index.js";

import sequelize from "../../database/connection.js";

class CoPsoMappingRepository {
  // ================================================================
  // CREATE
  // ================================================================

  async create(data) {
    return await CoPsoMapping.create(data);
  }

  // ================================================================
  // FIND ALL
  // ================================================================

  async findAll() {
    return await CoPsoMapping.findAll({
      include: [
        {
          model: CourseOutcome,
          as: "courseOutcome",
          attributes: [
            "id",
            "code",
            "coNumber",
            "description",
          ],
        },
        {
          model: ProgramSpecificOutcome,
          as: "programSpecificOutcome",
          attributes: [
            "id",
            "code",
            "description",
          ],
        },
      ],

      order: [["createdAt", "DESC"]],
    });
  }

  // ================================================================
  // FIND BY ID
  // ================================================================

  async findById(id) {
    return await CoPsoMapping.findByPk(id, {
      include: [
        {
          model: CourseOutcome,
          as: "courseOutcome",
          attributes: [
            "id",
            "code",
            "coNumber",
            "description",
          ],
        },
        {
          model: ProgramSpecificOutcome,
          as: "programSpecificOutcome",
          attributes: [
            "id",
            "code",
            "description",
          ],
        },
      ],
    });
  }

  // ================================================================
  // FIND BY COURSE OUTCOME
  // ================================================================

  async findByCourseOutcomeId(
    courseOutcomeId
  ) {
    return await CoPsoMapping.findAll({
      where: {
        courseOutcomeId,
      },

      include: [
        {
          model: ProgramSpecificOutcome,
          as: "programSpecificOutcome",
          attributes: [
            "id",
            "code",
            "description",
          ],
        },
      ],
    });
  }

  // ================================================================
  // FIND BY PROGRAM SPECIFIC OUTCOME
  // ================================================================

  async findByProgramSpecificOutcomeId(
    programSpecificOutcomeId
  ) {
    return await CoPsoMapping.findAll({
      where: {
        programSpecificOutcomeId,
      },

      include: [
        {
          model: CourseOutcome,
          as: "courseOutcome",
          attributes: [
            "id",
            "code",
            "coNumber",
            "description",
          ],
        },
      ],
    });
  }

  // ================================================================
  // FIND EXISTING MAPPING
  // ================================================================

  async findExistingMapping(
    courseOutcomeId,
    programSpecificOutcomeId
  ) {
    return await CoPsoMapping.findOne({
      where: {
        courseOutcomeId,
        programSpecificOutcomeId,
      },
    });
  }

  // ================================================================
  // GET CO–PSO MATRIX
  // ================================================================

  async getMatrixData(courseId) {
    const course = await Course.findByPk(
      courseId
    );

    if (!course) {
      return null;
    }

    // --------------------------------------------------------------
    // Get active Course Outcomes
    // --------------------------------------------------------------

    const courseOutcomes =
      await CourseOutcome.findAll({
        where: {
          courseId,
          status: true,
        },

        order: [
          ["coNumber", "ASC"],
        ],
      });

    // --------------------------------------------------------------
    // Get active PSOs belonging to course program
    // --------------------------------------------------------------

    const programSpecificOutcomes =
      await ProgramSpecificOutcome.findAll({
        where: {
          programId: course.programId,
          status: true,
        },

        order: [
          ["code", "ASC"],
        ],
      });

    // --------------------------------------------------------------
    // Get existing mappings
    // --------------------------------------------------------------

    const mappings =
      await CoPsoMapping.findAll({
        include: [
          {
            model: CourseOutcome,
            as: "courseOutcome",
            attributes: [
              "id",
              "code",
              "coNumber",
              "description",
            ],

            where: {
              courseId,
            },
          },

          {
            model: ProgramSpecificOutcome,
            as: "programSpecificOutcome",
            attributes: [
              "id",
              "code",
              "description",
            ],
          },
        ],
      });

    return {
      course,
      courseOutcomes,
      programSpecificOutcomes,
      mappings,
    };
  }

  // ================================================================
  // SAVE CO–PSO MATRIX
  // ================================================================

  async saveMatrix(
    courseOutcomeIds,
    matrix
  ) {
    const transaction =
      await sequelize.transaction();

    try {
      // ------------------------------------------------------------
      // Remove existing mappings for the
      // Course Outcomes belonging to this course
      // ------------------------------------------------------------

      await CoPsoMapping.destroy({
        where: {
          courseOutcomeId:
            courseOutcomeIds,
        },

        transaction,
      });

      // ------------------------------------------------------------
      // Only actual mappings are stored.
      //
      // mappingLevel:
      // 1 = Low
      // 2 = Medium
      // 3 = High
      //
      // Unmapped cells are NOT stored.
      // Frontend displays "-"
      // ------------------------------------------------------------

      if (matrix.length > 0) {
        await CoPsoMapping.bulkCreate(
          matrix,
          {
            transaction,
            validate: true,
          }
        );
      }

      await transaction.commit();

      return true;
    } catch (error) {
      await transaction.rollback();

      throw error;
    }
  }

  // ================================================================
  // UPDATE
  // ================================================================

  async update(
    mapping,
    data
  ) {
    return await mapping.update(
      data
    );
  }

  // ================================================================
  // DELETE
  // ================================================================

  async remove(mapping) {
    return await mapping.destroy();
  }
}

export default new CoPsoMappingRepository();