const Joi = require('joi');

const anonymousId = Joi.object({
  anonymousId: Joi.string().required(),
});

module.exports = {
  anonymousId,
};
