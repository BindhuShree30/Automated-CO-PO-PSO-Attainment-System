import api from "../api/axios";

/**
 * -----------------------------------------
 * Get Pending Users
 * -----------------------------------------
 */
const getPendingUsers = async () => {
  const response = await api.get(
    "/admin/pending-users"
  );

  return response.data.data;
};

/**
 * -----------------------------------------
 * Approve User
 * -----------------------------------------
 */
const approveUser = async (id) => {
  const response = await api.patch(
    `/admin/users/${id}/approve`
  );

  return response.data.data;
};

/**
 * -----------------------------------------
 * Reject User
 * -----------------------------------------
 */
const rejectUser = async (id) => {
  const response = await api.delete(
    `/admin/users/${id}`
  );

  return response.data.data;
};

export default {
  getPendingUsers,
  approveUser,
  rejectUser,
};