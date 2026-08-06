/**
 * ------------------------------------------------------------------
 * CO Attainment Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 * Calculates and manages Course Outcome attainment results.
 * ------------------------------------------------------------------
 */

import coAttainmentRepository from "./coAttainment.repository.js";
import courseOfferingRepository from "../courseOffering/courseOffering.repository.js";
import coRepository from "../co/co.repository.js";

import AssessmentQuestion from "../../database/models/AssessmentQuestion.js";
import Assessment from "../../database/models/Assessment.js";
import StudentQuestionMark from "../../database/models/StudentQuestionMark.js";

import ApiError from "../../shared/errors/ApiError.js";

/**
 * Calculate Attainment Level
 *
 * Level 3 → Percentage >= 80
 * Level 2 → Percentage >= 70
 * Level 1 → Percentage >= 60
 * Level 0 → Percentage < 60
 */
const calculateAttainmentLevel = (percentage) => {
  if (percentage >= 80) {
    return 3;
  }

  if (percentage >= 70) {
    return 2;
  }

  if (percentage >= 60) {
    return 1;
  }

  return 0;
};

/**
 * Calculate CO Attainment
 */
const calculateCOAttainment = async (
  courseOfferingId,
  courseOutcomeId
) => {
  /**
   * Check Course Offering
   */
  const courseOffering =
    await courseOfferingRepository.findById(
      courseOfferingId
    );

  if (!courseOffering) {
    throw new ApiError(
      404,
      "Course Offering not found."
    );
  }

  /**
   * Check Course Outcome
   */
  const courseOutcome =
    await coRepository.findById(
      courseOutcomeId
    );

  if (!courseOutcome) {
    throw new ApiError(
      404,
      "Course Outcome not found."
    );
  }

  /**
   * Ensure Course Outcome belongs to
   * the Course Offering course.
   */
  if (
    courseOutcome.courseId !==
    courseOffering.courseId
  ) {
    throw new ApiError(
      400,
      "Course Outcome does not belong to the Course Offering course."
    );
  }

  /**
   * Find Assessment Questions mapped to the CO
   * and belonging to the Course Offering.
   */
  const assessmentQuestions =
    await AssessmentQuestion.findAll({
      where: {
        courseOutcomeId,
        status: true,
      },

      include: [
        {
          model: Assessment,
          as: "assessment",
          required: true,

          where: {
            courseOfferingId,
            status: true,
          },

          attributes: [
            "id",
            "courseOfferingId",
          ],
        },
      ],
    });

  if (assessmentQuestions.length === 0) {
    throw new ApiError(
      400,
      "No Assessment Questions found for this Course Outcome and Course Offering."
    );
  }

  /**
   * Extract Assessment Question IDs
   */
  const assessmentQuestionIds =
    assessmentQuestions.map(
      (assessmentQuestion) =>
        assessmentQuestion.id
    );

  /**
   * Get Student Question Marks
   */
  const studentQuestionMarks =
    await StudentQuestionMark.findAll({
      where: {
        assessmentQuestionId:
          assessmentQuestionIds,

        status: true,
      },
    });

  if (studentQuestionMarks.length === 0) {
    throw new ApiError(
      400,
      "No Student Question Marks found for this Course Outcome."
    );
  }

  /**
   * Calculate Total Marks Obtained
   */
  const totalMarksObtained =
    studentQuestionMarks.reduce(
      (total, studentQuestionMark) => {
        return (
          total +
          Number(
            studentQuestionMark.marksObtained
          )
        );
      },
      0
    );

  /**
   * Create Question Maximum Marks Map
   *
   * Question ID → Maximum Marks
   */
  const questionMaxMarksMap = new Map(
    assessmentQuestions.map(
      (assessmentQuestion) => [
        assessmentQuestion.id,
        Number(
          assessmentQuestion.maxMarks
        ),
      ]
    )
  );

  /**
   * Calculate Total Maximum Marks
   *
   * Each StudentQuestionMark represents
   * one student's attempt for one question.
   */
  const totalMaxMarks =
    studentQuestionMarks.reduce(
      (total, studentQuestionMark) => {
        const questionMaxMarks =
          questionMaxMarksMap.get(
            studentQuestionMark.assessmentQuestionId
          ) || 0;

        return total + questionMaxMarks;
      },
      0
    );

  if (totalMaxMarks <= 0) {
    throw new ApiError(
      400,
      "Total maximum marks must be greater than zero."
    );
  }

  /**
   * Calculate Attainment Percentage
   */
  const attainmentPercentage = Number(
    (
      (totalMarksObtained /
        totalMaxMarks) *
      100
    ).toFixed(2)
  );

  /**
   * Calculate Attainment Level
   */
  const attainmentLevel =
    calculateAttainmentLevel(
      attainmentPercentage
    );

  /**
   * Prepare CO Attainment Data
   */
  const attainmentData = {
    courseOfferingId,
    courseOutcomeId,

    totalMarksObtained,
    totalMaxMarks,

    attainmentPercentage,
    attainmentLevel,

    status: true,
  };

  /**
   * Check Existing CO Attainment
   */
  const existingCOAttainment =
    await coAttainmentRepository.findByCourseOfferingAndCO(
      courseOfferingId,
      courseOutcomeId
    );

  /**
   * Update Existing CO Attainment
   */
  if (existingCOAttainment) {
    return await coAttainmentRepository.updateCOAttainment(
      existingCOAttainment,
      attainmentData
    );
  }

  /**
   * Create New CO Attainment
   */
  const createdCOAttainment =
    await coAttainmentRepository.createCOAttainment(
      attainmentData
    );

  /**
   * Return Created CO Attainment
   */
  return await coAttainmentRepository.findCOAttainmentById(
    createdCOAttainment.id
  );
};

/**
 * Get All CO Attainments
 */
const getCOAttainments = async () => {
  return await coAttainmentRepository.findAllCOAttainments();
};

/**
 * Get CO Attainment By ID
 */
const getCOAttainmentById = async (id) => {
  const coAttainment =
    await coAttainmentRepository.findCOAttainmentById(
      id
    );

  if (!coAttainment) {
    throw new ApiError(
      404,
      "CO Attainment not found."
    );
  }

  return coAttainment;
};

/**
 * Get CO Attainments By Course Offering
 */
const getCOAttainmentsByCourseOfferingId = async (
  courseOfferingId
) => {
  const courseOffering =
    await courseOfferingRepository.findById(
      courseOfferingId
    );

  if (!courseOffering) {
    throw new ApiError(
      404,
      "Course Offering not found."
    );
  }

  return await coAttainmentRepository.findByCourseOfferingId(
    courseOfferingId
  );
};

/**
 * Get CO Attainments By Course Outcome
 */
const getCOAttainmentsByCourseOutcomeId = async (
  courseOutcomeId
) => {
  const courseOutcome =
    await coRepository.findById(
      courseOutcomeId
    );

  if (!courseOutcome) {
    throw new ApiError(
      404,
      "Course Outcome not found."
    );
  }

  return await coAttainmentRepository.findByCourseOutcomeId(
    courseOutcomeId
  );
};

/**
 * Delete CO Attainment
 */
const deleteCOAttainment = async (id) => {
  const coAttainment =
    await coAttainmentRepository.findCOAttainmentById(
      id
    );

  if (!coAttainment) {
    throw new ApiError(
      404,
      "CO Attainment not found."
    );
  }

  await coAttainmentRepository.deleteCOAttainment(
    coAttainment
  );
};

export default {
  calculateCOAttainment,
  getCOAttainments,
  getCOAttainmentById,
  getCOAttainmentsByCourseOfferingId,
  getCOAttainmentsByCourseOutcomeId,
  deleteCOAttainment,
};