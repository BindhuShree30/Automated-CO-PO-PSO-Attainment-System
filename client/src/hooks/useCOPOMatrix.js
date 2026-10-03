import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getCourses,
  getCourse,
  getCourseOutcomes,
  getProgramOutcomes,
  getMatrix,
  saveMatrix,
} from "../services/coPoMappingService";

// =========================================================
// COURSES
// =========================================================

export const useCourses = () => {
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const response = await getCourses();

      return response.data?.data ?? [];
    },
  });
};

// =========================================================
// COURSE
// =========================================================

export const useCourse = (courseId) => {
  return useQuery({
    queryKey: ["course", courseId],
    enabled: Boolean(courseId),

    queryFn: async () => {
      const response =
        await getCourse(courseId);

      return response.data?.data ?? null;
    },
  });
};

// =========================================================
// COURSE OUTCOMES
// =========================================================

export const useCOs = (courseId) => {
  return useQuery({
    queryKey: ["course-outcomes", courseId],
    enabled: Boolean(courseId),

    queryFn: async () => {
      const response =
        await getCourseOutcomes(courseId);

      return response.data?.data ?? [];
    },
  });
};

// =========================================================
// PROGRAM OUTCOMES
// =========================================================

export const usePOs = (programId) => {
  return useQuery({
    queryKey: ["program-outcomes", programId],
    enabled: Boolean(programId),

    queryFn: async () => {
      const response =
        await getProgramOutcomes(programId);

      return response.data?.data ?? [];
    },
  });
};

// =========================================================
// MATRIX
// =========================================================

export const useMatrix = (courseId) => {
  return useQuery({
    queryKey: ["co-po-matrix", courseId],
    enabled: Boolean(courseId),

    queryFn: async () => {
      const response =
        await getMatrix(courseId);

      return (
        response.data?.data?.mappings ??
        []
      );
    },
  });
};

// =========================================================
// SAVE MATRIX
// =========================================================

export const useSaveMatrix = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: async (matrix) => {
      return await saveMatrix(matrix);
    },

    onSuccess: (_, __, context) => {
      queryClient.invalidateQueries({
        queryKey: ["co-po-matrix"],
      });
    },
  });
};