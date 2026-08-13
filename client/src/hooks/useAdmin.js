import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import adminService from "../services/adminService";

/**
 * -----------------------------------------
 * Pending Users
 * -----------------------------------------
 */
export const usePendingUsers = () => {
  return useQuery({
    queryKey: ["pending-users"],
    queryFn: adminService.getPendingUsers,
  });
};

/**
 * -----------------------------------------
 * Approve User
 * -----------------------------------------
 */
export const useApproveUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminService.approveUser,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pending-users"],
      });
    },
  });
};

/**
 * -----------------------------------------
 * Reject User
 * -----------------------------------------
 */
export const useRejectUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminService.rejectUser,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pending-users"],
      });
    },
  });
};