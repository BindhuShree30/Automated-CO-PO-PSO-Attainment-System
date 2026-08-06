import AcademicYearService from "./academicYear.service.js";

class AcademicYearController {

  async createAcademicYear(req, res, next) {
    try {

      const academicYear =
        await AcademicYearService.createAcademicYear(
          req.validatedData.body
        );

      return res.status(201).json({
        success: true,
        message: "Academic Year created successfully.",
        data: academicYear,
        error: null,
      });

    } catch (error) {
      next(error);
    }
  }

  async getAllAcademicYears(req, res, next) {
    try {

      const academicYears =
        await AcademicYearService.getAllAcademicYears();

      return res.status(200).json({
        success: true,
        message: "Academic Years fetched successfully.",
        data: academicYears,
        error: null,
      });

    } catch (error) {
      next(error);
    }
  }

  async getAcademicYearById(req, res, next) {
    try {

      const academicYear =
        await AcademicYearService.getAcademicYearById(
          req.validatedData.params.id
        );

      return res.status(200).json({
        success: true,
        message: "Academic Year fetched successfully.",
        data: academicYear,
        error: null,
      });

    } catch (error) {
      next(error);
    }
  }

  async updateAcademicYear(req, res, next) {
    try {

      const academicYear =
        await AcademicYearService.updateAcademicYear(
          req.validatedData.params.id,
          req.validatedData.body
        );

      return res.status(200).json({
        success: true,
        message: "Academic Year updated successfully.",
        data: academicYear,
        error: null,
      });

    } catch (error) {
      next(error);
    }
  }

  async deleteAcademicYear(req, res, next) {
    try {

      await AcademicYearService.deleteAcademicYear(
        req.validatedData.params.id
      );

      return res.status(200).json({
        success: true,
        message: "Academic Year deleted successfully.",
        data: null,
        error: null,
      });

    } catch (error) {
      next(error);
    }
  }
}

export default new AcademicYearController();