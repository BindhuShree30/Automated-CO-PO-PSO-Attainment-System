/**
 * ------------------------------------------------------------------
 * Course Offering Hooks
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import {
    useMutation,
    useQuery,
    useQueryClient,
  } from "@tanstack/react-query";
  
  import {
    getCourseOfferings,
    getCourseOfferingById,
    createCourseOffering,
    updateCourseOffering,
    deleteCourseOffering,
  } from "../services/courseOfferingService";
  
  /**
   * ------------------------------------------------------------------
   * Get All Course Offerings
   * ------------------------------------------------------------------
   */
  
  export const useCourseOfferings = () =>
    useQuery({
      queryKey: ["courseOfferings"],
      queryFn: getCourseOfferings,
    });
  
  /**
   * ------------------------------------------------------------------
   * Get Course Offering By ID
   * ------------------------------------------------------------------
   */
  
  export const useCourseOffering = (id) =>
    useQuery({
      queryKey: ["courseOffering", id],
      queryFn: () => getCourseOfferingById(id),
      enabled: Boolean(id),
    });
  
  /**
   * ------------------------------------------------------------------
   * Create Course Offering
   * ------------------------------------------------------------------
   */
  
  export const useCreateCourseOffering = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: createCourseOffering,
  
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["courseOfferings"],
        });
      },
    });
  };
  
  /**
   * ------------------------------------------------------------------
   * Update Course Offering
   * ------------------------------------------------------------------
   */
  
  export const useUpdateCourseOffering = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: updateCourseOffering,
  
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: ["courseOfferings"],
        });
  
        queryClient.invalidateQueries({
          queryKey: [
            "courseOffering",
            variables.id,
          ],
        });
      },
    });
  };
  
  /**
   * ------------------------------------------------------------------
   * Delete Course Offering
   * ------------------------------------------------------------------
   */
  
  export const useDeleteCourseOffering = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: deleteCourseOffering,
  
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["courseOfferings"],
        });
      },
    });
  };