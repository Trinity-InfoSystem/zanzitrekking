const { responseReturn } = require("../utilities/response");

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    responseReturn(res, 400, { error: error.details[0].message });
  }
  next();
};

module.exports = { validate };
