/**
 * ---------------------------------------------------------
 * Validation Middleware
 * ---------------------------------------------------------
 * Validates request body using a Zod schema.
 * Stores validated data in req.validatedData.
 * ---------------------------------------------------------
 */

const validate = (schema) => {
    return (req, res, next) => {
      const result = schema.safeParse(req.body);
  
      if (!result.success) {
        return next(result.error);
      }
  
      req.validatedData = result.data;
  
      next();
    };
  };
  
  export default validate;