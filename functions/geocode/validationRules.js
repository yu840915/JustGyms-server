const Joi = require('joi');

const geocode = Joi.object({
  q: Joi.string().required(),
});

module.exports = { geocode };
