/**
 * ------------------------------------------------------------------
 * Course Offering Controller
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 * Handles Course Offering HTTP requests and responses.
 * ------------------------------------------------------------------
 */

import CourseOfferingService from "./courseOffering.service.js";

class CourseOfferingController {
  /**
   * Create Course Offering
   */
  async createCourseOffering(req, res, next) {
    try {
      const courseOffering =
        await CourseOfferingService.createCourseOffering(
          req.validatedData.body
        );

      return res.status(201).json({
        success: true,
        message: "Course Offering created successfully.",
        data: courseOffering,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get All Course Offerings
   */
  async getAllCourseOfferings(req, res, next) {
    try {
      const courseOfferings =
        await CourseOfferingService.getAllCourseOfferings();

      return res.status(200).json({
        success: true,
        message: "Course Offerings fetched successfully.",
        data: courseOfferings,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Course Offering By ID
   */
  async getCourseOfferingById(req, res, next) {
    try {
      const courseOffering =
        await CourseOfferingService.getCourseOfferingById(
          req.validatedData.params.id
        );

      return res.status(200).json({
        success: true,
        message: "Course Offering fetched successfully.",
        data: courseOffering,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update Course Offering
   */
  async updateCourseOffering(req, res, next) {
    try {
      const courseOffering =
        await CourseOfferingService.updateCourseOffering(
          req.validatedData.params.id,
          req.validatedData.body
        );

      return res.status(200).json({
        success: true,
        message: "Course Offering updated successfully.",
        data: courseOffering,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete Course Offering
   */
  async deleteCourseOffering(req, res, next) {
    try {
      await CourseOfferingService.deleteCourseOffering(
        req.validatedData.params.id
      );

      return res.status(200).json({
        success: true,
        message: "Course Offering deleted successfully.",
        data: null,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CourseOfferingController();