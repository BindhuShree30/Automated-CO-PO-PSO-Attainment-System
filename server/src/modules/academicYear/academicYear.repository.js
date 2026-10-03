/**
 * ------------------------------------------------------------------
 * Academic Year Repository
 * ------------------------------------------------------------------
 */

import AcademicYear from "../../database/models/AcademicYear.js";

class AcademicYearRepository {
  /**
   * Create Academic Year
   */
  async create(data) {
    return await AcademicYear.create(data);
  }

  /**
   * Get All Academic Years
   */
  async findAll() {
    return await AcademicYear.findAll({
      order: [["startYear", "DESC"]],
    });
  }

  /**
   * Get Academic Year By ID
   */
  async findById(id) {
    return await AcademicYear.findByPk(id);
  }

  /**
   * Get Academic Year By Name
   */
  async findByName(name) {
    return await AcademicYear.findOne({
      where: { name },
    });
  }

  /**
   * Update Academic Year
   */
  async update(id, data) {
    const academicYear = await AcademicYear.findByPk(id);

    if (!academicYear) {
      return null;
    }

    return await academicYear.update(data);
  }

  /**
   * Delete Academic Year
   */
  async delete(id) {
    const academicYear = await AcademicYear.findByPk(id);

    if (!academicYear) {
      return null;
    }

    await academicYear.destroy();

    return true;
  }
}

export default new AcademicYearRepository();