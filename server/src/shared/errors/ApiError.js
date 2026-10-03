/**
 * ---------------------------------------------------------
 * Custom API Error Class
 * ---------------------------------------------------------
 * Used throughout the application to throw standardized
 * errors with HTTP status codes.
 * ---------------------------------------------------------
 */

class ApiError extends Error {
    constructor(statusCode, message) {
      super(message);
  
      this.statusCode = statusCode;
      this.message = message;
      this.success = false;
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export default ApiError;