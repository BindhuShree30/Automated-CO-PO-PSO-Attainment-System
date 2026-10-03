/**
 * ------------------------------------------------------------------
 * CO Attainment Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import coAttainmentRepository from "./coAttainment.repository.js";

import CourseOffering from "../../database/models/CourseOffering.js";
import CourseOutcome from "../../database/models/CourseOutcome.js";
import AssessmentQuestion from "../../database/models/AssessmentQuestion.js";
import Assessment from "../../database/models/Assessment.js";
import StudentQuestionMark from "../../database/models/StudentQuestionMark.js";

import ApiError from "../../shared/errors/ApiError.js";

/**
 * Calculate Attainment Level matching VTU/NBA Template:
 * Level 3 → Percentage >= 70
 * Level 2 → Percentage >= 60
 * Level 1 → Percentage >= 50
 * Level 0 → Percentage < 50
 */
const calculateAttainmentLevel = (percentage) => {
  if (percentage >= 70) return 3;
  if (percentage >= 60) return 2;
  if (percentage >= 50) return 1;
  return 0;
};

/**
 * Calculate Attainment for a Single Course Outcome
 */
const calculateSingleCO = async (courseOffering, courseOutcome) => {
  const courseOfferingId = courseOffering.id;
  const courseOutcomeId = courseOutcome.id;

  // 1. Fetch active assessment questions mapped to this CO
  const assessmentQuestions = await AssessmentQuestion.findAll({
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
        attributes: ["id", "courseOfferingId", "name", "maxMarks"],
      },
    ],
  });

  if (!assessmentQuestions || assessmentQuestions.length === 0) {
    return null;
  }

  const assessmentQuestionIds = assessmentQuestions.map((q) => q.id);

  // 2. Fetch recorded student marks
  const studentQuestionMarks = await StudentQuestionMark.findAll({
    where: {
      assessmentQuestionId: assessmentQuestionIds,
      status: true,
    },
  });

  if (!studentQuestionMarks || studentQuestionMarks.length === 0) {
    return null;
  }

  // 3. Normalize effective maximum marks for optional questions (paired OR choices)
  const rawSumMaxMarks = assessmentQuestions.reduce(
    (sum, q) => sum + Number(q.maxMarks || 0),
    0
  );
  const effectiveCoMaxMarks = rawSumMaxMarks > 25 ? rawSumMaxMarks / 2 : rawSumMaxMarks || 1;

  // 4. Calculate student-level attainment percentages
  const studentTotals = {};
  studentQuestionMarks.forEach((mark) => {
    const studentId = mark.studentId;
    if (!studentTotals[studentId]) {
      studentTotals[studentId] = 0;
    }
    if (!mark.isAbsent) {
      studentTotals[studentId] += Number(mark.marksObtained || 0);
    }
  });

  let totalStudentPercentages = 0;
  let attemptedStudentsCount = 0;
  let totalMarksObtained = 0;

  Object.values(studentTotals).forEach((obtained) => {
    totalMarksObtained += obtained;
    if (obtained > 0) {
      const studentPct = (obtained / effectiveCoMaxMarks) * 100;
      totalStudentPercentages += studentPct;
      attemptedStudentsCount++;
    }
  });

  const attainmentPercentage =
    attemptedStudentsCount > 0
      ? Number((totalStudentPercentages / attemptedStudentsCount).toFixed(2))
      : 0;

  const attainmentLevel = calculateAttainmentLevel(attainmentPercentage);
  const totalMaxMarks = Number((effectiveCoMaxMarks * attemptedStudentsCount).toFixed(2));

  const attainmentData = {
    courseOfferingId,
    courseOutcomeId,
    totalMarksObtained,
    totalMaxMarks,
    attainmentPercentage,
    attainmentLevel,
    status: true,
  };

  // Upsert record
  const existingCOAttainment =
    await coAttainmentRepository.findByCourseOfferingAndCO(
      courseOfferingId,
      courseOutcomeId
    );

  if (existingCOAttainment) {
    return await coAttainmentRepository.updateCOAttainment(
      existingCOAttainment,
      attainmentData
    );
  }

  const createdCOAttainment =
    await coAttainmentRepository.createCOAttainment(attainmentData);

  return await coAttainmentRepository.findCOAttainmentById(
    createdCOAttainment.id
  );
};

/**
 * Calculate CO Attainment (Single or Entire Offering)
 */
const calculateCOAttainment = async (courseOfferingId, courseOutcomeId) => {
  // Use CourseOffering model directly to avoid repository method-name mismatches
  const courseOffering = await CourseOffering.findByPk(courseOfferingId);
  if (!courseOffering) {
    throw new ApiError(404, "Course Offering not found.");
  }

  // If a specific CO ID is supplied, calculate only that CO
  if (courseOutcomeId) {
    const courseOutcome = await CourseOutcome.findByPk(courseOutcomeId);
    if (!courseOutcome) {
      throw new ApiError(404, "Course Outcome not found.");
    }
    if (courseOutcome.courseId !== courseOffering.courseId) {
      throw new ApiError(
        400,
        "Course Outcome does not belong to the Course Offering course."
      );
    }
    const result = await calculateSingleCO(courseOffering, courseOutcome);
    if (!result) {
      throw new ApiError(400, "No questions or marks recorded for this Course Outcome.");
    }
    return result;
  }

  // Otherwise, calculate all active COs configured for this course
  const courseOutcomes = await CourseOutcome.findAll({
    where: {
      courseId: courseOffering.courseId,
      status: true,
    },
    order: [["code", "ASC"]],
  });

  if (!courseOutcomes || courseOutcomes.length === 0) {
    throw new ApiError(400, "No Course Outcomes configured for this course.");
  }

  const results = [];
  for (const co of courseOutcomes) {
    const res = await calculateSingleCO(courseOffering, co);
    if (res) results.push(res);
  }

  return results;
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
  const coAttainment = await coAttainmentRepository.findCOAttainmentById(id);
  if (!coAttainment) {
    throw new ApiError(404, "CO Attainment not found.");
  }
  return coAttainment;
};

/**
 * Get CO Attainments By Course Offering
 */
const getCOAttainmentsByCourseOfferingId = async (courseOfferingId) => {
  const courseOffering = await CourseOffering.findByPk(courseOfferingId);
  if (!courseOffering) {
    throw new ApiError(404, "Course Offering not found.");
  }
  return await coAttainmentRepository.findByCourseOfferingId(courseOfferingId);
};

/**
 * Get CO Attainments By Course Outcome
 */
const getCOAttainmentsByCourseOutcomeId = async (courseOutcomeId) => {
  const courseOutcome = await CourseOutcome.findByPk(courseOutcomeId);
  if (!courseOutcome) {
    throw new ApiError(404, "Course Outcome not found.");
  }
  return await coAttainmentRepository.findByCourseOutcomeId(courseOutcomeId);
};

/**
 * Delete CO Attainment
 */
const deleteCOAttainment = async (id) => {
  const coAttainment = await coAttainmentRepository.findCOAttainmentById(id);
  if (!coAttainment) {
    throw new ApiError(404, "CO Attainment not found.");
  }
  await coAttainmentRepository.deleteCOAttainment(coAttainment);
};

export default {
  calculateCOAttainment,
  getCOAttainments,
  getCOAttainmentById,
  getCOAttainmentsByCourseOfferingId,
  getCOAttainmentsByCourseOutcomeId,
  deleteCOAttainment,
};