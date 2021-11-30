const Joi = require('joi');

const roles = Joi.object({
  val: Joi.array().items(Joi.string().allow('admin').only()).required(),
});
const userId = Joi.object({ userId: Joi.string().required() });

module.exports = { roles, userId };
