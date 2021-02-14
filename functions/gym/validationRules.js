const Joi = require('joi');
const { CSVArray } = require('../validatorExtensions');

const price = Joi.object({
  amount: Joi.number().required(),
  currency: Joi.string().required(),
});

const equipment = Joi.object({
  typeId: Joi.number().required(),
  name: Joi.string().required(),
  number: Joi.number().positive().required(),
  min: Joi.number().positive(),
  max: Joi.number().positive(),
});

const businessHours = Joi.object({
  start: Joi.number().required(),
  end: Joi.number().required(),
});

const coordinatesPrimitives = {
  lon: Joi.number().max(180).min(-180).required(),
  lat: Joi.number().max(90).min(-90).required(),
};

const createGym = Joi.object({
  ...coordinatesPrimitives,
  name: Joi.string().required(),
  equipments: Joi.array().items(equipment).required(),
  hourlyRate: price.required(),
  address: Joi.string().required(),
  capacity: Joi.number().required(),
  businessHours: Joi.array().items(businessHours).required(),
});

const gymList = Joi.object({
  ...coordinatesPrimitives,
  d: Joi.number().positive(),
  e: CSVArray.stringArray().items(Joi.number()),
  sort: Joi.string().allow(null, 'proximity', 'price'),
  desc: Joi.boolean(),
});
Joi.object;

module.exports = { createGym, gymList };
