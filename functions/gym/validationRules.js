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
  lon: Joi.number().max(180).min(-180),
  lat: Joi.number().max(90).min(-90),
};

const createGym = Joi.object({
  ...coordinatesPrimitives,
  id: Joi.string(),
  name: Joi.string().required(),
  phones: Joi.array().items(Joi.string().regex(/^0[\d]{7,9}$/)), //Taiwan phone number
  equipments: Joi.array().items(equipment).required(),
  hourlyRate: price,
  address: Joi.string().required(),
  capacity: Joi.number(),
  facilities: Joi.array().items(
    Joi.string().allow(
      'changingRoom',
      'toilet',
      'locker',
      'firstAid',
      'waterDispenser'
    )
  ),
  businessHours: Joi.array().items(businessHours).required(),
});

const gymList = Joi.object({
  ...coordinatesPrimitives,
  d: Joi.number().positive(),
  e: CSVArray.stringArray().items(Joi.number()),
  sort: Joi.string().allow(null, 'proximity', 'price'),
  desc: Joi.boolean(),
});

const gymMarkers = Joi.object({
  ...coordinatesPrimitives,
  d: Joi.number().positive().required(),
  e: CSVArray.stringArray().items(Joi.number()),
});

const imagesUrls = Joi.object({
  images: Joi.array().items(Joi.string().uri()).default([]),
});

module.exports = { createGym, gymList, gymMarkers, imagesUrls };
