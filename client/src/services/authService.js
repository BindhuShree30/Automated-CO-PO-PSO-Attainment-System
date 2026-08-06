import api from "../api/axios";

const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export default {
  login,
  register,
  getCurrentUser,
};