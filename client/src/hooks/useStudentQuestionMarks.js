import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMarksByAssessmentAndStudent,
  saveBulkStudentMarks,
  getQuestionsByAssessmentId,
  getDirectMarksByAssessment,
  saveBulkDirectMarks,
} from "../services/studentQuestionMarkService";

// ==================================================================
// QUESTION-WISE HOOKS (CIE / IA)
// ==================================================================

export const useAssessmentQuestions = (assessmentId) => {
  return useQuery({
    queryKey: ["assessmentQuestions", assessmentId],
    enabled: Boolean(assessmentId),
    queryFn: async () => {
      const res = await getQuestionsByAssessmentId(assessmentId);
      return res?.data?.data || res?.data || [];
    },
  });
};

export const useStudentAssessmentMarks = (assessmentId, studentId) => {
  return useQuery({
    queryKey: ["studentMarks", assessmentId, studentId],
    enabled: Boolean(assessmentId && studentId),
    queryFn: async () => {
      const res = await getMarksByAssessmentAndStudent(assessmentId, studentId);
      return res?.data?.data || res?.data || [];
    },
  });
};

export const useSaveStudentMarks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assessmentId, studentId, payload }) =>
      saveBulkStudentMarks(assessmentId, studentId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "studentMarks",
          variables.assessmentId,
          variables.studentId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["allAssessmentMarks", variables.assessmentId],
      });
    },
  });
};

// ==================================================================
// DIRECT / OVERALL MARKS HOOKS (Quiz, Assignment, Lab, SEE, Project)
// ==================================================================

export const useDirectMarks = (assessmentId) => {
  return useQuery({
    queryKey: ["directAssessmentMarks", assessmentId],
    enabled: Boolean(assessmentId),
    queryFn: async () => {
      const res = await getDirectMarksByAssessment(assessmentId);
      const list = res?.data?.data || res?.data || [];
      return Array.isArray(list) ? list : [];
    },
  });
};

export const useSaveDirectMarks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assessmentId, marks }) =>
      saveBulkDirectMarks(assessmentId, marks),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["directAssessmentMarks", variables.assessmentId],
      });
    },
  });
};