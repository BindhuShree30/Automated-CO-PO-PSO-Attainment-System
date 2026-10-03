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
import Student from "../../database/models/Student.js";

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
 * Helper to compute Best 2 of 3 Average for an array of test scores
 */
export const calculateBest2Of3Average = (scores = []) => {
  const clean = scores
    .map((s) => (s === null || s === undefined || isNaN(s) ? 0 : Number(s)))
    .sort((a, b) => b - a);

  if (clean.length === 0) return 0;
  if (clean.length === 1) return clean[0];

  const top1 = clean[0];
  const top2 = clean[1];
  return Number(((top1 + top2) / 2).toFixed(2));
};

/**
 * Helper to detect which 2 IAs are the best for each student
 * Returns Map<studentId, Set<assessmentId>>
 */
const getStudentBestIAAssessmentIds = async (courseOfferingId) => {
  // 1. Fetch all CIE/IA assessments for this course offering
  const iaAssessments = await Assessment.findAll({
    where: {
      courseOfferingId,
      status: true,
    },
    attributes: ["id", "name", "type", "calculationMethod", "maxMarks"],
    order: [["id", "ASC"]],
  });

  const iaList = iaAssessments.filter((a) => {
    const t = String(a.type || "").toUpperCase();
    return (
      ["CIE", "IA", "INTERNAL"].includes(t) ||
      a.calculationMethod === "BEST_OF_2"
    );
  });

  // If fewer than 3 IAs, no dropping needed — all are counted
  if (iaList.length < 3) {
    return null;
  }

  const iaIds = iaList.map((a) => a.id);

  // 2. Fetch all marks recorded under these IAs
  const marks = await StudentQuestionMark.findAll({
    include: [
      {
        model: AssessmentQuestion,
        as: "assessmentQuestion",
        where: { assessmentId: iaIds },
        attributes: ["id", "assessmentId", "maxMarks"],
      },
    ],
  });

  // 3. Compute student total per IA
  // studentScoresMap: { [studentId]: { [assessmentId]: totalObtained } }
  const studentScoresMap = {};
  marks.forEach((m) => {
    const sId = m.studentId;
    const aId = m.assessmentQuestion?.assessmentId;
    if (!sId || !aId) return;

    if (!studentScoresMap[sId]) studentScoresMap[sId] = {};
    if (!studentScoresMap[sId][aId]) studentScoresMap[sId][aId] = 0;

    if (!m.isAbsent) {
      studentScoresMap[sId][aId] += Number(m.marksObtained || 0);
    }
  });

  // 4. For each student, select top 2 assessment IDs
  const studentBestMap = new Map();
  Object.entries(studentScoresMap).forEach(([studentId, scoresObj]) => {
    const sortedAssessments = iaList
      .map((ia) => ({
        id: ia.id,
        score: scoresObj[ia.id] || 0,
      }))
      .sort((a, b) => b.score - a.score);

    // Pick top 2 assessment IDs
    const bestIds = new Set([
      sortedAssessments[0]?.id,
      sortedAssessments[1]?.id,
    ]);
    studentBestMap.set(studentId, bestIds);
  });

  return studentBestMap;
};

/**
 * Calculate Attainment for a Single Course Outcome
 */
const calculateSingleCO = async (
  courseOffering,
  courseOutcome,
  studentBestIAMap = null
) => {
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
        attributes: ["id", "courseOfferingId", "name", "type", "maxMarks"],
      },
    ],
  });

  if (!assessmentQuestions || assessmentQuestions.length === 0) {
    return null;
  }

  const questionMap = new Map(assessmentQuestions.map((q) => [q.id, q]));
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

  // 3. Group marks per student, applying "Best 2 of 3" IA filtering
  const studentData = {}; // studentId -> { obtained: 0, maxPossible: 0 }

  studentQuestionMarks.forEach((mark) => {
    const studentId = mark.studentId;
    const q = questionMap.get(mark.assessmentQuestionId);
    if (!q) return;

    const assessmentId = q.assessment?.id;
    const isIA = ["CIE", "IA", "INTERNAL"].includes(
      String(q.assessment?.type || "").toUpperCase()
    );

    // If Best 2 of 3 is active for IAs and this IA is NOT in student's top 2, drop it!
    if (isIA && studentBestIAMap && studentBestIAMap.has(studentId)) {
      const allowedAssessments = studentBestIAMap.get(studentId);
      if (!allowedAssessments.has(assessmentId)) {
        return; // Dropped test for this student
      }
    }

    if (!studentData[studentId]) {
      studentData[studentId] = { obtained: 0, maxPossible: 0 };
    }

    if (!mark.isAbsent) {
      studentData[studentId].obtained += Number(mark.marksObtained || 0);
    }
  });

  // Effective max marks per student for this CO
  // (Halve if paired OR choices exceed standard 25/50 mark allocation)
  const rawSumMaxMarks = assessmentQuestions.reduce(
    (sum, q) => sum + Number(q.maxMarks || 0),
    0
  );
  const effectiveCoMaxMarks =
    rawSumMaxMarks > 25 ? rawSumMaxMarks / 2 : rawSumMaxMarks || 1;

  let totalStudentPercentages = 0;
  let attemptedStudentsCount = 0;
  let totalMarksObtained = 0;

  Object.values(studentData).forEach((s) => {
    totalMarksObtained += s.obtained;
    if (s.obtained > 0) {
      const studentPct = (s.obtained / effectiveCoMaxMarks) * 100;
      totalStudentPercentages += Math.min(studentPct, 100);
      attemptedStudentsCount++;
    }
  });

  const attainmentPercentage =
    attemptedStudentsCount > 0
      ? Number((totalStudentPercentages / attemptedStudentsCount).toFixed(2))
      : 0;

  const attainmentLevel = calculateAttainmentLevel(attainmentPercentage);
  const totalMaxMarks = Number(
    (effectiveCoMaxMarks * attemptedStudentsCount).toFixed(2)
  );

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
  const courseOffering = await CourseOffering.findByPk(courseOfferingId);
  if (!courseOffering) {
    throw new ApiError(404, "Course Offering not found.");
  }

  // Pre-calculate student best 2 of 3 IA selections if 3 IAs exist
  const studentBestIAMap = await getStudentBestIAAssessmentIds(courseOfferingId);

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
    const result = await calculateSingleCO(
      courseOffering,
      courseOutcome,
      studentBestIAMap
    );
    if (!result) {
      throw new ApiError(
        400,
        "No questions or marks recorded for this Course Outcome."
      );
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
    const res = await calculateSingleCO(courseOffering, co, studentBestIAMap);
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
  calculateBest2Of3Average,
};