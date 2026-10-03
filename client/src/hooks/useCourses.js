/**
 * ------------------------------------------------------------------
 * Course Hooks
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../services/courseService";

/**
 * ------------------------------------------------------------------
 * Get All Courses
 * ------------------------------------------------------------------
 */
export const useCourses = () =>
  useQuery({
    queryKey: ["courses"],

    queryFn: async () => {
      const response = await getCourses();

      return response?.data?.data ?? [];
    },

    staleTime: 5 * 60 * 1000,

    retry: 1,
  });

/**
 * ------------------------------------------------------------------
 * Get Course By ID
 * ------------------------------------------------------------------
 */
export const useCourse = (id) =>
  useQuery({
    queryKey: ["course", id],

    enabled: Boolean(id),

    queryFn: async () => {
      const response = await getCourse(id);

      return response?.data?.data ?? null;
    },

    staleTime: 5 * 60 * 1000,

    retry: 1,
  });

/**
 * ------------------------------------------------------------------
 * Create Course
 * ------------------------------------------------------------------
 */
export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCourse,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["courses"],
      });
    },
  });
};

/**
 * ------------------------------------------------------------------
 * Update Course
 * ------------------------------------------------------------------
 */
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) =>
      updateCourse(id, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["courses"],
      });

      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: ["course", variables.id],
        });
      }
    },
  });
};

/**
 * ------------------------------------------------------------------
 * Delete Course
 * ------------------------------------------------------------------
 */
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCourse,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["courses"],
      });
    },
  });
};

export default {
  useCourses,
  useCourse,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
};