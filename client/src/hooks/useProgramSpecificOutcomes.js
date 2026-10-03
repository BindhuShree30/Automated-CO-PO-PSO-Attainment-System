/**
 * ------------------------------------------------------------------
 * Program Specific Outcome Hooks
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import {
    useQuery,
    useMutation,
    useQueryClient,
  } from "@tanstack/react-query";
  
  import {
    getProgramSpecificOutcomes,
    getProgramSpecificOutcome,
    getProgramSpecificOutcomesByProgram,
    createProgramSpecificOutcome,
    updateProgramSpecificOutcome,
    deleteProgramSpecificOutcome,
  } from "../services/programSpecificOutcomeService";
  
  /**
   * ------------------------------------------------------------------
   * Get All PSOs
   * ------------------------------------------------------------------
   */
  export const useProgramSpecificOutcomes = () => {
    return useQuery({
      queryKey: ["programSpecificOutcomes"],
  
      queryFn: async () => {
        const response =
          await getProgramSpecificOutcomes();
  
        return response.data?.data ?? [];
      },
    });
  };
  
  /**
   * ------------------------------------------------------------------
   * Get PSO By ID
   * ------------------------------------------------------------------
   */
  export const useProgramSpecificOutcome = (
    id
  ) => {
    return useQuery({
      queryKey: [
        "programSpecificOutcome",
        id,
      ],
  
      enabled: !!id,
  
      queryFn: async () => {
        const response =
          await getProgramSpecificOutcome(id);
  
        return response.data?.data ?? null;
      },
    });
  };
  
  /**
   * ------------------------------------------------------------------
   * Get PSOs By Program
   * ------------------------------------------------------------------
   */
  export const useProgramSpecificOutcomesByProgram = (
    programId
  ) => {
    return useQuery({
      queryKey: [
        "programSpecificOutcomes",
        "program",
        programId,
      ],
  
      enabled: !!programId,
  
      queryFn: async () => {
        const response =
          await getProgramSpecificOutcomesByProgram(
            programId
          );
  
        return response.data?.data ?? [];
      },
    });
  };
  
  /**
   * ------------------------------------------------------------------
   * Create PSO
   * ------------------------------------------------------------------
   */
  export const useCreateProgramSpecificOutcome = () => {
    const queryClient =
      useQueryClient();
  
    return useMutation({
      mutationFn:
        createProgramSpecificOutcome,
  
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "programSpecificOutcomes",
          ],
        });
      },
    });
  };
  
  /**
   * ------------------------------------------------------------------
   * Update PSO
   * ------------------------------------------------------------------
   */
  export const useUpdateProgramSpecificOutcome = () => {
    const queryClient =
      useQueryClient();
  
    return useMutation({
      mutationFn: ({
        id,
        data,
      }) =>
        updateProgramSpecificOutcome(
          id,
          data
        ),
  
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "programSpecificOutcomes",
          ],
        });
      },
    });
  };
  
  /**
   * ------------------------------------------------------------------
   * Delete PSO
   * ------------------------------------------------------------------
   */
  export const useDeleteProgramSpecificOutcome = () => {
    const queryClient =
      useQueryClient();
  
    return useMutation({
      mutationFn:
        deleteProgramSpecificOutcome,
  
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "programSpecificOutcomes",
          ],
        });
      },
    });
  };