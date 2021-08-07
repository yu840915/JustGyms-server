const Joi = require('joi');

const gymId = Joi.object({
  gymId: Joi.string().required(),
});

const addGyms = Joi.object({
  gyms: Joi.array().items(Joi.string().required()),
});

const fcmToken = Joi.object({ token: Joi.string().required() });

module.exports = {
  addGyms,
  gymId,
  fcmToken,
};
