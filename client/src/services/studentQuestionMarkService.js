import api from "../api/axios";

/**
 * Fetch assessments for a specific course offering
 */
export const getAssessmentsByCourseOffering = (courseOfferingId) => {
  return api.get(`/assessments/course-offering/${courseOfferingId}`);
};

/**
 * Fetch all marks recorded for an entire assessment (used by View All Marks Ledger)
 */
export const getMarksByAssessment = (assessmentId) => {
  return api.get(`/student-question-marks?assessmentId=${assessmentId}`);
};

/**
 * Fetch marks for a student in a specific assessment
 */
export const getMarksByAssessmentAndStudent = (assessmentId, studentId) => {
  return api.get(
    `/student-question-marks/assessment/${assessmentId}/student/${studentId}`
  );
};

/**
 * Save / Update student marks with question OR-choices
 */
export const saveBulkStudentMarks = (assessmentId, studentId, payload) => {
  return api.post(
    `/student-question-marks/assessment/${assessmentId}/student/${studentId}/bulk`,
    payload
  );
};

/**
 * Get question mapping / assessment questions
 */
export const getQuestionsByAssessmentId = (assessmentId) => {
  return api.get(`/assessment-questions/assessment/${assessmentId}`);
};