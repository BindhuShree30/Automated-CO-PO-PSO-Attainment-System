import {
    useQuery,
    useMutation,
    useQueryClient,
  } from "@tanstack/react-query";
  
  import {
    getDepartments,
    getDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  } from "../services/departmentService";
  
  /**
   * Get All Departments
   */
  export const useDepartments = () =>
    useQuery({
      queryKey: ["departments"],
      queryFn: async () => {
        const { data } = await getDepartments();
        return data.data;
      },
    });
  
  /**
   * Get Department By ID
   */
  export const useDepartment = (id) =>
    useQuery({
      queryKey: ["department", id],
      enabled: !!id,
      queryFn: async () => {
        const { data } = await getDepartment(id);
        return data.data;
      },
    });
  
  /**
   * Create Department
   */
  export const useCreateDepartment = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: createDepartment,
  
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["departments"],
        });
      },
    });
  };
  
  /**
   * Update Department
   */
  export const useUpdateDepartment = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: ({ id, data }) =>
        updateDepartment(id, data),
  
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["departments"],
        });
      },
    });
  };
  
  /**
   * Delete Department
   */
  export const useDeleteDepartment = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: deleteDepartment,
  
      onSuccess: async () => {
        await queryClient.invalidateQueries({
            queryKey: ["departments"],
        });
    },
    });
  };