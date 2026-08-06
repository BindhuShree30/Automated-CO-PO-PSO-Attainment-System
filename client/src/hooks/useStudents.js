import {
    useQuery,
    useMutation,
    useQueryClient,
  } from "@tanstack/react-query";
  
  import {
    getStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
  } from "../services/studentService";
  
  export const useStudents = () =>
    useQuery({
      queryKey: ["students"],
      queryFn: async () => {
        const { data } = await getStudents();
        return data.data;
      },
    });
  
  export const useStudent = (id) =>
    useQuery({
      queryKey: ["student", id],
      enabled: !!id,
      queryFn: async () => {
        const { data } = await getStudent(id);
        return data.data;
      },
    });
  
  export const useCreateStudent = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: createStudent,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["students"],
        });
      },
    });
  };
  
  export const useUpdateStudent = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: ({ id, data }) =>
        updateStudent(id, data),
  
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["students"],
        });
      },
    });
  };
  
  export const useDeleteStudent = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: deleteStudent,
  
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["students"],
        });
      },
    });
  };