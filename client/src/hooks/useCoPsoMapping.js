/**
 * ------------------------------------------------------------------
 * CO–PSO Mapping Hooks
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import {
    useQuery,
    useMutation,
    useQueryClient,
  } from "@tanstack/react-query";
  
  import {
    getCoPsoMatrix,
    automateCoPsoMapping,
    saveCoPsoMatrix,
    getCoPsoMappings,
    getCoPsoMapping,
    getCoPsoMappingsByCourseOutcome,
    getCoPsoMappingsByPso,
    createCoPsoMapping,
    updateCoPsoMapping,
    deleteCoPsoMapping,
  } from "../services/coPsoMappingService";
  
  /**
   * ------------------------------------------------------------------
   * Get CO–PSO Matrix
   * ------------------------------------------------------------------
   */
  
  export const useCoPsoMatrix = (
    courseId
  ) => {
    return useQuery({
      queryKey: [
        "co-pso-matrix",
        courseId,
      ],
  
      enabled: Boolean(courseId),
  
      queryFn: () =>
        getCoPsoMatrix(courseId),
    });
  };
  
  /**
   * ------------------------------------------------------------------
   * Automated CO–PSO Mapping
   * ------------------------------------------------------------------
   *
   * Gemini generates mapping suggestions.
   *
   * IMPORTANT:
   *
   * This does NOT save anything to the database.
   *
   * Faculty reviews the generated suggestions first.
   *
   * ------------------------------------------------------------------
   */
  
  export const useAutomateCoPsoMapping =
    () => {
      return useMutation({
        mutationFn: (
          courseId
        ) =>
          automateCoPsoMapping(
            courseId
          ),
      });
    };
  
  /**
   * ------------------------------------------------------------------
   * Save CO–PSO Matrix
   * ------------------------------------------------------------------
   */
  
  export const useSaveCoPsoMatrix = () => {
    const queryClient =
      useQueryClient();
  
    return useMutation({
      mutationFn: ({
        courseId,
        matrix,
      }) =>
        saveCoPsoMatrix(
          courseId,
          matrix
        ),
  
      onSuccess: (
        _data,
        variables
      ) => {
        queryClient.invalidateQueries({
          queryKey: [
            "co-pso-matrix",
            variables.courseId,
          ],
        });
  
        queryClient.invalidateQueries({
          queryKey: [
            "co-pso-mappings",
          ],
        });
      },
    });
  };
  
  /**
   * ------------------------------------------------------------------
   * Get All CO–PSO Mappings
   * ------------------------------------------------------------------
   */
  
  export const useCoPsoMappings = () => {
    return useQuery({
      queryKey: [
        "co-pso-mappings",
      ],
  
      queryFn:
        getCoPsoMappings,
    });
  };
  
  /**
   * ------------------------------------------------------------------
   * Get CO–PSO Mapping By ID
   * ------------------------------------------------------------------
   */
  
  export const useCoPsoMapping = (
    id
  ) => {
    return useQuery({
      queryKey: [
        "co-pso-mapping",
        id,
      ],
  
      enabled: Boolean(id),
  
      queryFn: () =>
        getCoPsoMapping(id),
    });
  };
  
  /**
   * ------------------------------------------------------------------
   * Get Mappings By Course Outcome
   * ------------------------------------------------------------------
   */
  
  export const useCoPsoMappingsByCourseOutcome =
    (courseOutcomeId) => {
      return useQuery({
        queryKey: [
          "co-pso-mappings",
          "course-outcome",
          courseOutcomeId,
        ],
  
        enabled: Boolean(
          courseOutcomeId
        ),
  
        queryFn: () =>
          getCoPsoMappingsByCourseOutcome(
            courseOutcomeId
          ),
      });
    };
  
  /**
   * ------------------------------------------------------------------
   * Get Mappings By PSO
   * ------------------------------------------------------------------
   */
  
  export const useCoPsoMappingsByPso = (
    programSpecificOutcomeId
  ) => {
    return useQuery({
      queryKey: [
        "co-pso-mappings",
        "pso",
        programSpecificOutcomeId,
      ],
  
      enabled: Boolean(
        programSpecificOutcomeId
      ),
  
      queryFn: () =>
        getCoPsoMappingsByPso(
          programSpecificOutcomeId
        ),
    });
  };
  
  /**
   * ------------------------------------------------------------------
   * Create CO–PSO Mapping
   * ------------------------------------------------------------------
   */
  
  export const useCreateCoPsoMapping =
    () => {
      const queryClient =
        useQueryClient();
  
      return useMutation({
        mutationFn:
          createCoPsoMapping,
  
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: [
              "co-pso-mappings",
            ],
          });
        },
      });
    };
  
  /**
   * ------------------------------------------------------------------
   * Update CO–PSO Mapping
   * ------------------------------------------------------------------
   */
  
  export const useUpdateCoPsoMapping =
    () => {
      const queryClient =
        useQueryClient();
  
      return useMutation({
        mutationFn: ({
          id,
          data,
        }) =>
          updateCoPsoMapping(
            id,
            data
          ),
  
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: [
              "co-pso-mappings",
            ],
          });
        },
      });
    };
  
  /**
   * ------------------------------------------------------------------
   * Delete CO–PSO Mapping
   * ------------------------------------------------------------------
   */
  
  export const useDeleteCoPsoMapping =
    () => {
      const queryClient =
        useQueryClient();
  
      return useMutation({
        mutationFn:
          deleteCoPsoMapping,
  
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: [
              "co-pso-mappings",
            ],
          });
        },
      });
    };