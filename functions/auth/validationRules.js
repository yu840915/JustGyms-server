const Joi = require('joi');

const emailAuth = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = {
  emailAuth,
};
