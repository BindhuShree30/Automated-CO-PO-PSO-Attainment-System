/**
 * ------------------------------------------------------------------
 * Semester Controller
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 * Handles Semester HTTP requests and responses.
 * ------------------------------------------------------------------
 */

import SemesterService from "./semester.service.js";

class SemesterController {
  /**
   * Create Semester
   */
  async createSemester(req, res, next) {
    try {
      const semester = await SemesterService.createSemester(
        req.validatedData.body
      );

      return res.status(201).json({
        success: true,
        message: "Semester created successfully.",
        data: semester,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get All Semesters
   */
  async getAllSemesters(req, res, next) {
    try {
      const semesters =
        await SemesterService.getAllSemesters();

      return res.status(200).json({
        success: true,
        message: "Semesters fetched successfully.",
        data: semesters,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Semester By ID
   */
  async getSemesterById(req, res, next) {
    try {
      const semester =
        await SemesterService.getSemesterById(
          req.validatedData.params.id
        );

      return res.status(200).json({
        success: true,
        message: "Semester fetched successfully.",
        data: semester,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update Semester
   */
  async updateSemester(req, res, next) {
    try {
      const semester =
        await SemesterService.updateSemester(
          req.validatedData.params.id,
          req.validatedData.body
        );

      return res.status(200).json({
        success: true,
        message: "Semester updated successfully.",
        data: semester,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete Semester
   */
  async deleteSemester(req, res, next) {
    try {
      await SemesterService.deleteSemester(
        req.validatedData.params.id
      );

      return res.status(200).json({
        success: true,
        message: "Semester deleted successfully.",
        data: null,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SemesterController();