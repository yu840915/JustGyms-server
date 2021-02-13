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
});

const businessHours = Joi.object({
  start: Joi.number().required(),
  end: Joi.number().required(),
});

const createGym = Joi.object({
  name: Joi.string().required(),
  equipments: Joi.array().items(equipment).required(),
  hourlyRate: price.required(),
  address: Joi.string().required(),
  lat: Joi.number().required(),
  lon: Joi.number().required(),
  capacity: Joi.number().required(),
  businessHours: Joi.array().items(businessHours).required(),
});

const gymList = Joi.object({
  lat: Joi.number().required(),
  lon: Joi.number().required(),
  d: Joi.number().positive(),
  e: CSVArray.stringArray().items(Joi.number()),
  sort: Joi.string().allow(null, 'proximity', 'price'),
  desc: Joi.boolean(),
});

module.exports = { createGym, gymList };
