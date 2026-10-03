import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMarksByAssessmentAndStudent,
  saveBulkStudentMarks,
  getQuestionsByAssessmentId,
} from "../services/studentQuestionMarkService";

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
    },
  });
};