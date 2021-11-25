const Joi = require('joi');

const anonymousId = Joi.object({
  anonymousId: Joi.string().required(),
});

const userId = Joi.object({ userId: Joi.string().required() });

module.exports = {
  anonymousId,
  userId,
};
