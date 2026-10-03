/**
 * ------------------------------------------------------------------
 * Academic Year Service
 * ------------------------------------------------------------------
 */

import AcademicYearRepository from "./academicYear.repository.js";
import AcademicYear from "../../database/models/AcademicYear.js";

class AcademicYearService {
  /**
   * Create Academic Year
   */
  async createAcademicYear(data) {
    // Check duplicate name
    const existing = await AcademicYearRepository.findByName(data.name);

    if (existing) {
      throw new Error("Academic Year already exists.");
    }

    // Validate years
    if (data.endYear !== data.startYear + 1) {
      throw new Error(
        "End Year must be exactly one year greater than Start Year."
      );
    }

    // Only one current academic year
    if (data.isCurrent) {
      await AcademicYear.update(
        { isCurrent: false },
        {
          where: {
            isCurrent: true,
          },
        }
      );
    }

    return await AcademicYearRepository.create(data);
  }

  /**
   * Get All Academic Years
   */
  async getAllAcademicYears() {
    return await AcademicYearRepository.findAll();
  }

  /**
   * Get Academic Year By ID
   */
  async getAcademicYearById(id) {
    const academicYear = await AcademicYearRepository.findById(id);

    if (!academicYear) {
      throw new Error("Academic Year not found.");
    }

    return academicYear;
  }

  /**
   * Update Academic Year
   */
  async updateAcademicYear(id, data) {
    const academicYear = await AcademicYearRepository.findById(id);

    if (!academicYear) {
      throw new Error("Academic Year not found.");
    }

    // Duplicate check
    if (data.name && data.name !== academicYear.name) {
      const existing = await AcademicYearRepository.findByName(data.name);

      if (existing) {
        throw new Error("Academic Year already exists.");
      }
    }

    // Validate year
    if (
      data.startYear &&
      data.endYear &&
      data.endYear !== data.startYear + 1
    ) {
      throw new Error(
        "End Year must be exactly one year greater than Start Year."
      );
    }

    // Only one current year
    if (data.isCurrent) {
      await AcademicYear.update(
        { isCurrent: false },
        {
          where: {
            isCurrent: true,
          },
        }
      );
    }

    return await AcademicYearRepository.update(id, data);
  }

  /**
   * Delete Academic Year
   */
  async deleteAcademicYear(id) {
    const deleted = await AcademicYearRepository.delete(id);

    if (!deleted) {
      throw new Error("Academic Year not found.");
    }

    return true;
  }
}

export default new AcademicYearService();