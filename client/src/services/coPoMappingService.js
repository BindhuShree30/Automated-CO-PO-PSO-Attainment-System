import api from "../api/axios";

// =========================================================
// COURSES
// =========================================================

export const getCourses = () => {
  return api.get("/courses");
};

// =========================================================
// COURSE BY ID
// =========================================================

export const getCourse = (courseId) => {
  return api.get(
    `/courses/${courseId}`
  );
};

// =========================================================
// COURSE OUTCOMES
// =========================================================

export const getCourseOutcomes = (
  courseId
) => {
  return api.get(
    `/co/course/${courseId}`
  );
};

// =========================================================
// PROGRAM OUTCOMES
// =========================================================

export const getProgramOutcomes = (
  programId
) => {
  return api.get(
    `/program-outcomes/program/${programId}`
  );
};

// =========================================================
// GET CO-PO MATRIX
// =========================================================

export const getMatrix = (
  courseId
) => {
  return api.get(
    `/co-po-mappings/matrix/${courseId}`
  );
};

// =========================================================
// SAVE CO-PO MATRIX
// =========================================================

export const saveMatrix = (
  matrix
) => {
  return api.post(
    "/co-po-mappings/matrix",
    {
      matrix,
    }
  );
};

// =========================================================
// AUTOMATIC CO-PO MAPPING
// =========================================================
//
// Sends the selected course to the backend.
// Backend → Gemini AI → CO-PO suggestions.
//
// IMPORTANT:
// AI suggestions are returned for faculty review.
// They are NOT automatically saved.
//

export const generateAutomaticMapping = (
  courseId
) => {
  return api.post(
    "/co-po-mappings/automate",
    {
      courseId,
    }
  );
};