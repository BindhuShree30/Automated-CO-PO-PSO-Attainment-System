import api from "../api/axios";

// ==========================================================
// GET QUESTIONS BY ASSESSMENT
// ==========================================================

export const getQuestionsByAssessment = async (
  assessmentId
) => {
  return api.get(
    `/assessment-questions/assessment/${assessmentId}`
  );
};

// ==========================================================
// PREVIEW UPLOADED QUESTION PAPER
// ==========================================================

export const previewAssessmentQuestionUpload =
  async (assessmentId, file) => {
    const formData = new FormData();

    formData.append(
      "assessmentId",
      assessmentId
    );

    formData.append("file", file);

    const response = await api.post(
      "/assessment-questions/upload-preview",
      formData
    );

    return (
      response.data?.data ??
      response.data
    );
  };

// ==========================================================
// CONFIRM REVIEWED QUESTIONS
// ==========================================================

export const confirmAssessmentQuestionUpload =
  async (
    assessmentId,
    questions
  ) => {
    const response = await api.post(
      "/assessment-questions/upload-confirm",
      {
        assessmentId,
        questions,
      }
    );

    return (
      response.data?.data ??
      response.data
    );
  };

// ==========================================================
// GET COURSE OUTCOMES BY COURSE
// ==========================================================

export const getCourseOutcomesByCourse =
  async (courseId) => {
    const response = await api.get(
      `/co/course/${courseId}`
    );

    const payload =
      response.data?.data ??
      response.data;

    if (Array.isArray(payload)) {
      return payload;
    }

    if (
      Array.isArray(
        payload?.courseOutcomes
      )
    ) {
      return payload.courseOutcomes;
    }

    if (
      Array.isArray(payload?.data)
    ) {
      return payload.data;
    }

    return [];
  };