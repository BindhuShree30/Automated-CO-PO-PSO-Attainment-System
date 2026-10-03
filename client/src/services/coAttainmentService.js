import api from "../api/axios";

/**
 * Trigger CO attainment calculation for a course offering
 * Passing only courseOfferingId calculates all active COs in bulk.
 */
export const calculateCOAttainment = (courseOfferingId, courseOutcomeId = null) => {
  return api.post("/co-attainments/calculate", {
    courseOfferingId,
    ...(courseOutcomeId ? { courseOutcomeId } : {}),
  });
};

/**
 * Fetch calculated CO attainments for a course offering
 */
export const getCOAttainmentsByOffering = (courseOfferingId) => {
  return api.get(`/co-attainments/course-offering/${courseOfferingId}`);
};