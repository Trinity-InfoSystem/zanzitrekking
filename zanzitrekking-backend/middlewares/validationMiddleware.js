const { responseReturn } = require("../utilities/response");

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // Return all errors, not just the first one
    stripUnknown: true, // Remove unknown fields
  });
  
  if (error) {
    const errorMessages = error.details.map(detail => detail.message).join(", ");
    return responseReturn(res, 400, { error: errorMessages });
  }
  
  // Replace req.body with validated and sanitized value
  req.body = value;
  next();
};

module.exports = { validate };
