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

/**
 * ---------------------------------------------------------
 * Courses
 * ---------------------------------------------------------
 */
export const useCourses = () =>
  useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data } = await getCourses();
      return data.data;
    },
  });

/**
 * ---------------------------------------------------------
 * Course
 * ---------------------------------------------------------
 */
export const useCourse = (courseId) =>
  useQuery({
    queryKey: ["course", courseId],
    enabled: !!courseId,
    queryFn: async () => {
      const { data } = await getCourse(courseId);
      return data.data;
    },
  });

/**
 * ---------------------------------------------------------
 * COs
 * ---------------------------------------------------------
 */
export const useCOs = (courseId) =>
  useQuery({
    queryKey: ["cos", courseId],
    enabled: !!courseId,
    queryFn: async () => {
      const { data } = await getCourseOutcomes(courseId);
      return data.data;
    },
  });

/**
 * ---------------------------------------------------------
 * POs
 * ---------------------------------------------------------
 */
export const usePOs = (programId) =>
  useQuery({
    queryKey: ["pos", programId],
    enabled: !!programId,
    queryFn: async () => {
      const { data } = await getProgramOutcomes(programId);
      return data.data;
    },
  });

/**
 * ---------------------------------------------------------
 * Matrix
 * ---------------------------------------------------------
 */
export const useMatrix = (courseId) =>
  useQuery({
    queryKey: ["matrix", courseId],
    enabled: !!courseId,
    queryFn: async () => {
      const { data } = await getMatrix(courseId);
      return data.data.mappings ?? [];
    },
  });

/**
 * ---------------------------------------------------------
 * Save
 * ---------------------------------------------------------
 */
export const useSaveMatrix = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveMatrix,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["matrix"],
      });
    },
  });
};