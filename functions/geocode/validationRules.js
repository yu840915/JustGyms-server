const Joi = require('joi');

const search = Joi.object({
  q: Joi.string().required(),
  country: Joi.string().length(2).uppercase().allow('TW'),
});

module.exports = { search };
