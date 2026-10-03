/**
 * ------------------------------------------------------------------
 * JWT Helper
 * ------------------------------------------------------------------
 */

import jwt from "jsonwebtoken";
import env from "../../config/env.config.js";

/**
 * Generate Access Token
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.jwt.secret);
};