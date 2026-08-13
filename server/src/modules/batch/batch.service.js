/**
 * ------------------------------------------------------------------
 * Batch Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Handles Batch business logic.
 *
 * Dynamic behavior:
 *
 * Batch creation automatically creates:
 *
 *     Batch
 *       ↓
 *     Academic Years
 *       ↓
 *     Semesters
 *
 * Number of semesters:
 *
 *     Program Duration × 2
 *
 * Example:
 *
 * 4-year Program
 *     ↓
 * 8 Semesters
 *
 * 3-year Program
 *     ↓
 * 6 Semesters
 *
 * Academic Year mapping:
 *
 * Semester 1, 2 → Batch Start Year     - Batch Start Year + 1
 * Semester 3, 4 → Batch Start Year + 1 - Batch Start Year + 2
 * Semester 5, 6 → Batch Start Year + 2 - Batch Start Year + 3
 * ...
 * ------------------------------------------------------------------
 */

import sequelize from "../../database/connection.js";

import BatchRepository from "./batch.repository.js";

import Program from "../../database/models/Program.js";
import AcademicYear from "../../database/models/AcademicYear.js";
import Semester from "../../database/models/Semester.js";

import ApiError from "../../shared/errors/ApiError.js";

class BatchService {
  /**
   * ----------------------------------------------------------------
   * Create Batch
   * ----------------------------------------------------------------
   *
   * Creates:
   *
   * 1. Batch
   * 2. Required Academic Years
   * 3. Required Semesters
   *
   * Everything happens inside one transaction.
   *
   * If any operation fails, everything is rolled back.
   * ----------------------------------------------------------------
   */
  async createBatch(data) {
    const {
      programId,
      startYear,
      endYear,
      status = true,
    } = data;

    /**
     * --------------------------------------------------------------
     * Start Transaction
     * --------------------------------------------------------------
     */
    const transaction =
      await sequelize.transaction();

    try {
      /**
       * ------------------------------------------------------------
       * Check Program
       * ------------------------------------------------------------
       */
      const program =
        await Program.findByPk(
          programId,
          {
            transaction,
          }
        );

      if (!program) {
        throw new ApiError(
          404,
          "Program not found."
        );
      }

      /**
       * ------------------------------------------------------------
       * Validate Batch Duration
       * ------------------------------------------------------------
       *
       * Example:
       *
       * Program duration = 4
       * Start year       = 2024
       * End year         = 2028
       *
       * 2028 === 2024 + 4
       *
       * Correct.
       * ------------------------------------------------------------
       */
      if (
        endYear !==
        startYear + program.duration
      ) {
        throw new ApiError(
          400,
          `Batch duration must match the Program duration of ${program.duration} years.`
        );
      }

      /**
       * ------------------------------------------------------------
       * Check Duplicate Batch
       * ------------------------------------------------------------
       */
      const existingBatch =
        await BatchRepository.findByProgramAndYears(
          programId,
          startYear,
          endYear,
          transaction
        );

      if (existingBatch) {
        throw new ApiError(
          409,
          "Batch already exists for this Program and year range."
        );
      }

      /**
       * ------------------------------------------------------------
       * Generate Batch Name
       * ------------------------------------------------------------
       */
      const name =
        `${startYear}-${endYear}`;

      /**
       * ------------------------------------------------------------
       * Create Batch
       * ------------------------------------------------------------
       */
      const batch =
        await BatchRepository.create(
          {
            programId,
            startYear,
            endYear,
            name,
            status,
          },
          transaction
        );

      /**
       * ------------------------------------------------------------
       * Number Of Semesters
       * ------------------------------------------------------------
       *
       * Every academic year has:
       *
       *     ODD  semester
       *     EVEN semester
       *
       * Therefore:
       *
       *     duration × 2
       * ------------------------------------------------------------
       */
      const totalSemesters =
        program.duration * 2;

      /**
       * ------------------------------------------------------------
       * Generate Academic Years + Semesters
       * ------------------------------------------------------------
       */
      for (
        let semesterNumber = 1;
        semesterNumber <= totalSemesters;
        semesterNumber++
      ) {
        /**
         * ----------------------------------------------------------
         * Calculate Academic Year
         * ----------------------------------------------------------
         *
         * Semester:
         *
         * 1,2 → offset 0
         * 3,4 → offset 1
         * 5,6 → offset 2
         * 7,8 → offset 3
         */
        const yearOffset =
          Math.floor(
            (semesterNumber - 1) / 2
          );

        const academicYearStart =
          startYear + yearOffset;

        const academicYearEnd =
          academicYearStart + 1;

        const academicYearName =
          `${academicYearStart}-${academicYearEnd}`;

        /**
         * ----------------------------------------------------------
         * Find Existing Academic Year
         * ----------------------------------------------------------
         */
        let academicYear =
          await AcademicYear.findOne({
            where: {
              startYear:
                academicYearStart,

              endYear:
                academicYearEnd,
            },

            transaction,
          });

        /**
         * ----------------------------------------------------------
         * Create Academic Year If Missing
         * ----------------------------------------------------------
         *
         * We do NOT create duplicates.
         *
         * Example:
         *
         * 2024-2025 already exists
         *
         * → reuse it.
         * ----------------------------------------------------------
         */
        if (!academicYear) {
          academicYear =
            await AcademicYear.create(
              {
                name:
                  academicYearName,

                startYear:
                  academicYearStart,

                endYear:
                  academicYearEnd,

                isCurrent:
                  false,

                status:
                  true,
              },
              {
                transaction,
              }
            );
        }

        /**
         * ----------------------------------------------------------
         * Calculate Term
         * ----------------------------------------------------------
         */
        const term =
          semesterNumber % 2 === 0
            ? "EVEN"
            : "ODD";

        /**
         * ----------------------------------------------------------
         * Check Existing Semester
         * ----------------------------------------------------------
         *
         * Normally there will not be one because this is
         * a newly created Batch.
         *
         * The check makes this operation safer.
         * ----------------------------------------------------------
         */
        const existingSemester =
          await Semester.findOne({
            where: {
              batchId:
                batch.id,

              semesterNumber,
            },

            transaction,
          });

        if (!existingSemester) {
          /**
           * --------------------------------------------------------
           * Create Semester
           * --------------------------------------------------------
           */
          await Semester.create(
            {
              semesterNumber,

              batchId:
                batch.id,

              academicYearId:
                academicYear.id,

              term,

              startDate:
                null,

              endDate:
                null,

              isCurrent:
                false,

              status:
                true,
            },
            {
              transaction,
            }
          );
        }
      }

      /**
       * ------------------------------------------------------------
       * Commit Transaction
       * ------------------------------------------------------------
       */
      await transaction.commit();

      /**
       * ------------------------------------------------------------
       * Return Created Batch
       * ------------------------------------------------------------
       */
      return batch;
    } catch (error) {
      /**
       * ------------------------------------------------------------
       * Rollback Everything
       * ------------------------------------------------------------
       */
      await transaction.rollback();

      throw error;
    }
  }

  /**
   * ----------------------------------------------------------------
   * Get All Batches
   * ----------------------------------------------------------------
   */
  async getAllBatches() {
    return BatchRepository.findAll();
  }

  /**
   * ----------------------------------------------------------------
   * Get Batch By ID
   * ----------------------------------------------------------------
   */
  async getBatchById(id) {
    const batch =
      await BatchRepository.findById(id);

    if (!batch) {
      throw new ApiError(
        404,
        "Batch not found."
      );
    }

    return batch;
  }

  /**
   * ----------------------------------------------------------------
   * Update Batch
   * ----------------------------------------------------------------
   *
   * IMPORTANT:
   *
   * Updating the year range of an existing batch can affect
   * already-created semesters and academic years.
   *
   * Therefore we do not automatically regenerate semesters
   * during update.
   *
   * Batch creation is responsible for initial generation.
   * ----------------------------------------------------------------
   */
  async updateBatch(id, data) {
    const batch =
      await BatchRepository.findById(id);

    if (!batch) {
      throw new ApiError(
        404,
        "Batch not found."
      );
    }

    const programId =
      data.programId ??
      batch.programId;

    const startYear =
      data.startYear ??
      batch.startYear;

    const endYear =
      data.endYear ??
      batch.endYear;

    /**
     * --------------------------------------------------------------
     * Check Program
     * --------------------------------------------------------------
     */
    const program =
      await Program.findByPk(
        programId
      );

    if (!program) {
      throw new ApiError(
        404,
        "Program not found."
      );
    }

    /**
     * --------------------------------------------------------------
     * Validate Duration
     * --------------------------------------------------------------
     */
    if (
      endYear !==
      startYear + program.duration
    ) {
      throw new ApiError(
        400,
        `Batch duration must match the Program duration of ${program.duration} years.`
      );
    }

    /**
     * --------------------------------------------------------------
     * Check Duplicate
     * --------------------------------------------------------------
     */
    const existingBatch =
      await BatchRepository.findByProgramAndYears(
        programId,
        startYear,
        endYear
      );

    if (
      existingBatch &&
      existingBatch.id !== id
    ) {
      throw new ApiError(
        409,
        "Batch already exists for this Program and year range."
      );
    }

    /**
     * --------------------------------------------------------------
     * Regenerate Name
     * --------------------------------------------------------------
     */
    const name =
      `${startYear}-${endYear}`;

    return BatchRepository.update(
      id,
      {
        ...data,

        programId,

        startYear,

        endYear,

        name,
      }
    );
  }

  /**
   * ----------------------------------------------------------------
   * Delete Batch
   * ----------------------------------------------------------------
   */
  async deleteBatch(id) {
    const deleted =
      await BatchRepository.delete(id);

    if (!deleted) {
      throw new ApiError(
        404,
        "Batch not found."
      );
    }

    return true;
  }
}

export default new BatchService();