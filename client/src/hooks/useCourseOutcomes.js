import {
    useQuery,
    useMutation,
    useQueryClient,
  } from "@tanstack/react-query";
  
  import * as api from "../services/courseOutcomeApi";
  
  export const useCourseOutcomes = () =>
    useQuery({
      queryKey: ["course-outcomes"],
      queryFn: api.getCourseOutcomes,
    });
  
  export const useCourseOutcomesByCourse = (
    courseId
  ) =>
    useQuery({
      queryKey: [
        "course-outcomes",
        courseId,
      ],
      queryFn: () =>
        api.getCourseOutcomesByCourse(courseId),
      enabled: !!courseId,
    });
  
  export const useCourseOutcome = (id) =>
    useQuery({
      queryKey: ["course-outcome", id],
      queryFn: () =>
        api.getCourseOutcomeById(id),
      enabled: !!id,
    });
  
  export const useCreateCourseOutcome = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: api.createCourseOutcome,
  
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["course-outcomes"],
        });
      },
    });
  };
  
  export const useUpdateCourseOutcome = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: ({ id, data }) =>
        api.updateCourseOutcome(id, data),
  
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["course-outcomes"],
        });
      },
    });
  };
  
  export const useDeleteCourseOutcome = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: api.deleteCourseOutcome,
  
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["course-outcomes"],
        });
      },
    });
  };