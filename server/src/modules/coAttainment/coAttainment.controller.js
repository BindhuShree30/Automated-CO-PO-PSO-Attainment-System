/**
 * ------------------------------------------------------------------
 * CO Attainment Controller
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import coAttainmentService from "./coAttainment.service.js";
import asyncHandler from "../../shared/helpers/asyncHandler.js";
import {
  successResponse,
} from "../../shared/helpers/apiResponse.js";

/**
 * Calculate CO Attainment
 */
const calculateCOAttainment = asyncHandler(
  async (req, res) => {
    const {
      courseOfferingId,
      courseOutcomeId,
    } = req.validatedData.body;

    const coAttainment =
      await coAttainmentService.calculateCOAttainment(
        courseOfferingId,
        courseOutcomeId
      );

    return successResponse(
      res,
      "CO Attainment calculated successfully.",
      coAttainment,
      200
    );
  }
);

/**
 * Get All CO Attainments
 */
const getCOAttainments = asyncHandler(
  async (req, res) => {
    const coAttainments =
      await coAttainmentService.getCOAttainments();

    return successResponse(
      res,
      "CO Attainments fetched successfully.",
      coAttainments
    );
  }
);

/**
 * Get CO Attainment By ID
 */
const getCOAttainmentById = asyncHandler(
  async (req, res) => {
    const coAttainment =
      await coAttainmentService.getCOAttainmentById(
        req.params.id
      );

    return successResponse(
      res,
      "CO Attainment fetched successfully.",
      coAttainment
    );
  }
);

/**
 * Get CO Attainments By Course Offering
 */
const getCOAttainmentsByCourseOfferingId =
  asyncHandler(async (req, res) => {
    const coAttainments =
      await coAttainmentService.getCOAttainmentsByCourseOfferingId(
        req.params.courseOfferingId
      );

    return successResponse(
      res,
      "Course Offering CO Attainments fetched successfully.",
      coAttainments
    );
  });

/**
 * Get CO Attainments By Course Outcome
 */
const getCOAttainmentsByCourseOutcomeId =
  asyncHandler(async (req, res) => {
    const coAttainments =
      await coAttainmentService.getCOAttainmentsByCourseOutcomeId(
        req.params.courseOutcomeId
      );

    return successResponse(
      res,
      "Course Outcome Attainments fetched successfully.",
      coAttainments
    );
  });

/**
 * Delete CO Attainment
 */
const deleteCOAttainment = asyncHandler(
  async (req, res) => {
    await coAttainmentService.deleteCOAttainment(
      req.params.id
    );

    return successResponse(
      res,
      "CO Attainment deleted successfully.",
      null
    );
  }
);

export default {
  calculateCOAttainment,
  getCOAttainments,
  getCOAttainmentById,
  getCOAttainmentsByCourseOfferingId,
  getCOAttainmentsByCourseOutcomeId,
  deleteCOAttainment,
};