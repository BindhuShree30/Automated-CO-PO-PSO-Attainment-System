import {
    useQuery,
    useMutation,
    useQueryClient,
  } from "@tanstack/react-query";
  
  import {
    getSemesters,
    getSemester,
    createSemester,
    updateSemester,
    deleteSemester,
  } from "../services/semesterService";
  
  /**
   * ---------------------------------------------------------
   * Get All Semesters
   * ---------------------------------------------------------
   */
  export const useSemesters = () =>
    useQuery({
      queryKey: ["semesters"],
      queryFn: async () => {
        const { data } = await getSemesters();
  
        return data.data;
      },
    });
  
  /**
   * ---------------------------------------------------------
   * Get Semester By ID
   * ---------------------------------------------------------
   */
  export const useSemester = (id) =>
    useQuery({
      queryKey: ["semester", id],
      enabled: !!id,
  
      queryFn: async () => {
        const { data } = await getSemester(id);
  
        return data.data;
      },
    });
  
  /**
   * ---------------------------------------------------------
   * Create Semester
   * ---------------------------------------------------------
   */
  export const useCreateSemester = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: createSemester,
  
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["semesters"],
        });
      },
    });
  };
  
  /**
   * ---------------------------------------------------------
   * Update Semester
   * ---------------------------------------------------------
   */
  export const useUpdateSemester = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: ({ id, data }) =>
        updateSemester(id, data),
  
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["semesters"],
        });
      },
    });
  };
  
  /**
   * ---------------------------------------------------------
   * Delete Semester
   * ---------------------------------------------------------
   */
  export const useDeleteSemester = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: deleteSemester,
  
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ["semesters"],
        });
      },
    });
  };