import { StatusCodes } from "http-status-codes";

import poAttainmentService from "./poAttainment.service.js";

const createPOAttainment = async (req, res, next) => {
  try {
    const attainment = await poAttainmentService.createPOAttainment(
      req.validatedData.body
    );

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "PO Attainment created successfully.",
      data: attainment,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

const calculatePOAttainment = async (req, res, next) => {
  try {
    const { courseOfferingId, programOutcomeId } =
      req.validatedData.body;

    const attainment =
      await poAttainmentService.calculatePOAttainment(
        courseOfferingId,
        programOutcomeId
      );

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "PO Attainment calculated successfully.",
      data: attainment,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

const getPOAttainments = async (req, res, next) => {
  try {
    const attainments =
      await poAttainmentService.getPOAttainments();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "PO Attainments fetched successfully.",
      data: attainments,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

const getPOAttainmentById = async (req, res, next) => {
  try {
    const { id } = req.validatedData.params;

    const attainment =
      await poAttainmentService.getPOAttainmentById(id);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "PO Attainment fetched successfully.",
      data: attainment,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

const updatePOAttainment = async (req, res, next) => {
  try {
    const { id } = req.validatedData.params;

    const attainment =
      await poAttainmentService.updatePOAttainment(
        id,
        req.validatedData.body
      );

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "PO Attainment updated successfully.",
      data: attainment,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

const deletePOAttainment = async (req, res, next) => {
  try {
    const { id } = req.validatedData.params;

    await poAttainmentService.deletePOAttainment(id);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "PO Attainment deleted successfully.",
      data: null,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createPOAttainment,
  calculatePOAttainment,
  getPOAttainments,
  getPOAttainmentById,
  updatePOAttainment,
  deletePOAttainment,
};