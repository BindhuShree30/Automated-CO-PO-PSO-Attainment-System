import {
    useQuery,
    useMutation,
    useQueryClient,
  } from "@tanstack/react-query";
  
  import {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
  } from "../services/courseService";
  
  export const useCourses = () =>
    useQuery({
      queryKey: ["courses"],
      queryFn: async () => {
        const { data } = await getCourses();
        return data.data;
      },
    });
  
  export const useCourse = (id) =>
    useQuery({
      queryKey: ["course", id],
      enabled: !!id,
      queryFn: async () => {
        const { data } = await getCourse(id);
        return data.data;
      },
    });
  
  export const useCreateCourse = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: createCourse,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["courses"],
        });
      },
    });
  };
  
  export const useUpdateCourse = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: ({ id, data }) =>
        updateCourse(id, data),
  
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["courses"],
        });
      },
    });
  };
  
  export const useDeleteCourse = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: deleteCourse,
  
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["courses"],
        });
      },
    });
  };