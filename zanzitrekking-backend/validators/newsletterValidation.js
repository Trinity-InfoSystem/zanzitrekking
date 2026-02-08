const Joi = require("joi");

const subscribeSchema = Joi.object({
  email: Joi.string().email().required(),
  subscriptionSource: Joi.string()
    .valid("website", "mobile-app", "admin", "other")
    .default("website"),
  isSubscribed: Joi.boolean().optional(),
});


module.exports = {
  subscribeSchema,
};
