import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getCourseOfferings,
  getMyCourseOfferings,
  getCourseOffering,
  createCourseOffering,
  updateCourseOffering,
  deleteCourseOffering,
} from "../services/courseOfferingService";

/**
 * =========================================================
 * ALL COURSE OFFERINGS
 * =========================================================
 */
export const useCourseOfferings = () =>
  useQuery({
    queryKey: ["course-offerings"],
    queryFn: async () => {
      const response =
        await getCourseOfferings();

      return response.data?.data ?? [];
    },
  });

/**
 * =========================================================
 * MY COURSE OFFERINGS
 * =========================================================
 *
 * Returns only Course Offerings assigned
 * to the currently logged-in faculty.
 *
 * =========================================================
 */
export const useMyCourseOfferings = () =>
  useQuery({
    queryKey: ["my-course-offerings"],
    queryFn: async () => {
      const response =
        await getMyCourseOfferings();

      return response.data?.data ?? [];
    },
  });

/**
 * =========================================================
 * COURSE OFFERING BY ID
 * =========================================================
 */
export const useCourseOffering = (id) =>
  useQuery({
    queryKey: ["course-offering", id],
    enabled: Boolean(id),

    queryFn: async () => {
      const response =
        await getCourseOffering(id);

      return response.data?.data ?? null;
    },
  });

/**
 * =========================================================
 * CREATE
 * =========================================================
 */
export const useCreateCourseOffering = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: createCourseOffering,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["course-offerings"],
      });

      queryClient.invalidateQueries({
        queryKey: ["my-course-offerings"],
      });
    },
  });
};

/**
 * =========================================================
 * UPDATE
 * =========================================================
 */
export const useUpdateCourseOffering = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }) =>
      updateCourseOffering(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["course-offerings"],
      });

      queryClient.invalidateQueries({
        queryKey: ["my-course-offerings"],
      });
    },
  });
};

/**
 * =========================================================
 * DELETE
 * =========================================================
 */
export const useDeleteCourseOffering = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: deleteCourseOffering,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["course-offerings"],
      });

      queryClient.invalidateQueries({
        queryKey: ["my-course-offerings"],
      });
    },
  });
};