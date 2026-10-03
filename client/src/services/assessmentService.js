import api from "../api/axios";

/**
 * ------------------------------------------------------------------
 * Assessment Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

/**
 * Get all assessments
 */
export const getAssessments = () => {
  return api.get("/assessments");
};

/**
 * Get assessments for a specific course offering
 */
export const getAssessmentsByCourseOffering = (courseOfferingId) => {
  return api.get(
    `/assessments/course-offering/${courseOfferingId}`
  );
};

/**
 * Get assessment by ID
 */
export const getAssessmentById = (id) => {
  return api.get(`/assessments/${id}`);
};
/**
 * Fetch all students' recorded marks for an entire assessment
 */
export const getMarksByAssessment = (assessmentId) => {
  return api.get(`/student-question-marks?assessmentId=${assessmentId}`);
};