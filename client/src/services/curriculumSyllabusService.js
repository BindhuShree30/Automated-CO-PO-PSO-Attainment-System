import api from "../api/axios";

/**
 * 1. Upload Syllabus PDF
 * POST /curriculum/upload-syllabus
 * Note: uses formData.append("syllabus", file)
 */
export const uploadSyllabus = async (courseOfferingId, file) => {
  const formData = new FormData();
  formData.append("courseOfferingId", courseOfferingId);
  formData.append("syllabus", file);

  const response = await api.post("/curriculum/upload-syllabus", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data?.data;
};

/**
 * 2. Extract Text from PDF
 * POST /curriculum/extract/:syllabusId
 */
export const extractSyllabusText = async (syllabusId) => {
  const response = await api.post(`/curriculum/extract/${syllabusId}`);
  return response.data?.data;
};

/**
 * 3. Analyze Syllabus via Gemini AI
 * POST /curriculum/analyze/:syllabusId
 */
export const analyzeSyllabusAI = async (syllabusId) => {
  const response = await api.post(`/curriculum/analyze/${syllabusId}`);
  return response.data?.data;
};

/**
 * 4. Run Gap Analysis
 * POST /curriculum/gap-analysis/:syllabusId
 * Optionally passes custom industry benchmarks (PDF or text)
 */
export const analyzeCurriculumGaps = async (syllabusId, industryFile = null, industryText = "") => {
  const formData = new FormData();
  if (industryFile) {
    formData.append("industryPdf", industryFile);
  }
  if (industryText.trim()) {
    formData.append("industryText", industryText);
  }

  const response = await api.post(`/curriculum/gap-analysis/${syllabusId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data?.data;
};

export default {
  uploadSyllabus,
  extractSyllabusText,
  analyzeSyllabusAI,
  analyzeCurriculumGaps,
};