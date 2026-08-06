import {
    useQuery,
    useMutation,
    useQueryClient,
  } from "@tanstack/react-query";
  
  import {
    getProgramOutcomes,
    getProgramOutcome,
    createProgramOutcome,
    updateProgramOutcome,
    deleteProgramOutcome,
  } from "../services/programOutcomeService";
  
  /**
   * ---------------------------------------------------------
   * Get All Program Outcomes
   * ---------------------------------------------------------
   */
  export const useProgramOutcomes = () =>
    useQuery({
      queryKey: ["programOutcomes"],
      queryFn: async () => {
        const { data } = await getProgramOutcomes();
        return data.data;
      },
    });
  
  /**
   * ---------------------------------------------------------
   * Get Program Outcome By ID
   * ---------------------------------------------------------
   */
  export const useProgramOutcome = (id) =>
    useQuery({
      queryKey: ["programOutcome", id],
      enabled: !!id,
      queryFn: async () => {
        const { data } = await getProgramOutcome(id);
        return data.data;
      },
    });
  
  /**
   * ---------------------------------------------------------
   * Create Program Outcome
   * ---------------------------------------------------------
   */
  export const useCreateProgramOutcome = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: createProgramOutcome,
  
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["programOutcomes"],
        });
      },
    });
  };
  
  /**
   * ---------------------------------------------------------
   * Update Program Outcome
   * ---------------------------------------------------------
   */
  export const useUpdateProgramOutcome = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: ({ id, data }) =>
        updateProgramOutcome(id, data),
  
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["programOutcomes"],
        });
      },
    });
  };
  
  /**
   * ---------------------------------------------------------
   * Delete Program Outcome
   * ---------------------------------------------------------
   */
  export const useDeleteProgramOutcome = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: deleteProgramOutcome,
  
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["programOutcomes"],
        });
      },
    });
  };