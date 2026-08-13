/**
 * ---------------------------------------------------------
 * Authentication Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ---------------------------------------------------------
 */

import api from "../api/axios";

/**
 * ---------------------------------------------------------
 * Login
 * ---------------------------------------------------------
 */
const login = async (
  credentials
) => {

  const response =
    await api.post(
      "/auth/login",
      credentials
    );

  return response.data;
};


/**
 * ---------------------------------------------------------
 * Register Faculty
 * ---------------------------------------------------------
 *
 * Backend automatically assigns:
 *
 * role   = FACULTY
 * status = PENDING
 *
 * The frontend does NOT send role.
 * ---------------------------------------------------------
 */
const register = async (
 userData
) => {

  const response =
    await api.post(
      "/auth/register",
      userData
    );

  return response.data;
};


/**
 * ---------------------------------------------------------
 * Export
 * ---------------------------------------------------------
 */
export default {
  login,
  register,
};