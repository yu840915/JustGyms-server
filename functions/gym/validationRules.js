const Joi = require('joi');
const { CSVArray } = require('../validatorExtensions');

const price = Joi.object({
  amount: Joi.number().positive().required(),
  currency: Joi.string().required(),
});

const fare = Joi.object({
  unit: Joi.string().allow('hour', 'time', 'min', 'day').only().required(),
  amount: Joi.number().positive().required(),
  price,
});

const equipment = Joi.object({
  typeId: Joi.number().required(),
  name: Joi.string().required(),
  number: Joi.number().positive().required(),
  min: Joi.number().positive(),
  max: Joi.number().positive(),
});

const businessHours = Joi.object({
  dayOfWeek: Joi.string()
    .allow('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun')
    .only(),
  start: Joi.string()
    .regex(/^[\d]{2}:[\d]{2}$/)
    .required(),
  end: Joi.string()
    .regex(/^[\d]{2}:[\d]{2}$/)
    .required(),
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
  pricing: Joi.array().items(fare),
  address: Joi.string().required(),
  capacity: Joi.number(),
  pageLink: Joi.string().uri(),
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

const uploadUrl = Joi.object({ imageId: Joi.string().required() });

const gymList = Joi.object({
  ...coordinatesPrimitives,
  d: Joi.number().positive(),
  e: CSVArray.stringArray().items(Joi.number()),
  sort: Joi.string().allow(null, 'proximity', 'price'),
  desc: Joi.boolean(),
});

const gymId = Joi.object({
  gymId: Joi.string().alphanum().required(),
});

const gymMarkers = Joi.object({
  ...coordinatesPrimitives,
  d: Joi.number().positive().required(),
  e: CSVArray.stringArray().items(Joi.number()),
});

const imagesUrls = Joi.object({
  images: Joi.array().items(Joi.string().uri()).default([]),
});

const addAdmin = Joi.object({ user: Joi.string().required() });

const removeAdmin = Joi.object({
  gymId: Joi.string().alphanum().required(),
  user: Joi.string().required(),
});

const createAppointment = Joi.object({
  startAt: Joi.date().required(),
  endAt: Joi.date().required(),
});

const cancelAppointment = Joi.object({
  gymId: Joi.string().alphanum().required(),
  appointmentId: Joi.string().alphanum().required(),
});

module.exports = {
  createGym,
  gymList,
  gymMarkers,
  imagesUrls,
  uploadUrl,
  gymId,
  addAdmin,
  removeAdmin,
  createAppointment,
  cancelAppointment,
};
