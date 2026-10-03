/**
 * ------------------------------------------------------------------
 * Student Question Mark & Direct Marks API Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import api from "../api/axios"; // Uses your configured Axios / API client instance

// ==================================================================
// QUESTION-WISE MARKS SERVICES (CIE / IA)
// ==================================================================

/**
 * Fetch all configured questions for an assessment
 * GET /api/v1/assessment-questions/assessment/:assessmentId
 */
export const getQuestionsByAssessmentId = async (assessmentId) => {
  return await api.get(`/assessment-questions/assessment/${assessmentId}`);
};

/**
 * Fetch saved question marks for one student in one assessment
 * GET /api/v1/student-question-marks/assessment/:assessmentId/student/:studentId
 */
export const getMarksByAssessmentAndStudent = async (assessmentId, studentId) => {
  return await api.get(
    `/student-question-marks/assessment/${assessmentId}/student/${studentId}`
  );
};

/**
 * Save question marks for one student in one assessment (atomic OR parts save)
 * POST /api/v1/student-question-marks/assessment/:assessmentId/student/:studentId/bulk
 */
export const saveBulkStudentMarks = async (assessmentId, studentId, payload) => {
  return await api.post(
    `/student-question-marks/assessment/${assessmentId}/student/${studentId}/bulk`,
    payload
  );
};

/**
 * Fetch all question marks for an assessment (used by Master Ledger table)
 * GET /api/v1/student-question-marks/assessment/:assessmentId
 */
export const getMarksByAssessment = async (assessmentId) => {
  return await api.get(`/student-question-marks/assessment/${assessmentId}`);
};

/**
 * Fetch assessments for a course offering
 * GET /api/v1/assessments/course-offering/:courseOfferingId
 */
export const getAssessmentsByCourseOffering = async (courseOfferingId) => {
  return await api.get(`/assessments/course-offering/${courseOfferingId}`);
};

// ==================================================================
// DIRECT / OVERALL MARKS SERVICES (Quiz, Assignment, Lab, SEE, Project)
// ==================================================================

/**
 * Fetch all direct marks for an assessment
 * GET /api/v1/student-question-marks/assessment/:assessmentId/direct
 */
export const getDirectMarksByAssessment = async (assessmentId) => {
  return await api.get(
    `/student-question-marks/assessment/${assessmentId}/direct`
  );
};

/**
 * Bulk save / update direct marks for an entire course offering
 * POST /api/v1/student-question-marks/assessment/:assessmentId/direct/bulk
 */
export const saveBulkDirectMarks = async (assessmentId, marks) => {
  return await api.post(
    `/student-question-marks/assessment/${assessmentId}/direct/bulk`,
    { marks }
  );
};

export default {
  getQuestionsByAssessmentId,
  getMarksByAssessmentAndStudent,
  saveBulkStudentMarks,
  getMarksByAssessment,
  getAssessmentsByCourseOffering,
  getDirectMarksByAssessment,
  saveBulkDirectMarks,
};