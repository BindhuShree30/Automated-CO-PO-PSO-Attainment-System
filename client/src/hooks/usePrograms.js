import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getPrograms,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram,
} from "../services/programService";

export const usePrograms = () =>
  useQuery({
    queryKey: ["programs"],
    queryFn: async () => {
      const { data } = await getPrograms();
      return data.data;
    },
  });

export const useProgram = (id) =>
  useQuery({
    queryKey: ["program", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await getProgram(id);
      return data.data;
    },
  });

export const useCreateProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProgram,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["programs"],
      });
    },
  });
};

export const useUpdateProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) =>
      updateProgram(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["programs"],
      });
    },
  });
};

export const useDeleteProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProgram,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["programs"],
      });
    },
  });
};