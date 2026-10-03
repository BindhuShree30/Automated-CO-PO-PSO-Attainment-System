import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCOAttainmentsByOffering,
  calculateCOAttainment,
} from "../services/coAttainmentService";

/**
 * Hook to retrieve CO attainments for a course offering
 */
export const useCourseOfferingAttainments = (courseOfferingId) => {
  return useQuery({
    queryKey: ["coAttainments", courseOfferingId],
    enabled: Boolean(courseOfferingId),
    queryFn: async () => {
      const res = await getCOAttainmentsByOffering(courseOfferingId);
      return res?.data?.data || res?.data || [];
    },
  });
};

/**
 * Hook to trigger CO attainment recalculation
 */
export const useCalculateCOAttainment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseOfferingId, courseOutcomeId }) =>
      calculateCOAttainment(courseOfferingId, courseOutcomeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["coAttainments", variables.courseOfferingId],
      });
    },
  });
};