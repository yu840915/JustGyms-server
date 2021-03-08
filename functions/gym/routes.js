const express = require('express');
const validator = require('express-joi-validation').createValidator({});
const validationRules = require('./validationRules');
const { createGym } = require('./editGym');
const {
  findNearbyGyms,
  findNearbyGymsAndConvertToMapMarkers,
} = require('./gymList');
const { getEquipmentTemplateList } = require('./equipmentTemplateList');
const { asyncRequestHandler } = require('../firebaseFunctions');

const app = express.Router();

app.post(
  '',
  validator.body(validationRules.createGym),
  asyncRequestHandler(async (req, res) => {
    await createGym(req.body);
    res.sendStatus(201);
  })
);

app.get(
  '',
  validator.query(validationRules.gymList),
  asyncRequestHandler(async (req, res) => {
    const { lat, lon, d, e, sort } = req.query;
    res.send(
      await findNearbyGyms({
        lat,
        lon,
        radiusInM: d,
        equipmentTypes: e,
        sortBy: sort,
      })
    );
  })
);

app.get(
  '/markers',
  validator.query(validationRules.gymMarkers),
  asyncRequestHandler(async (req, res) => {
    const { lat, lon, d, e } = req.query;
    res.send(
      await findNearbyGymsAndConvertToMapMarkers({
        lat,
        lon,
        radiusInM: d,
        equipmentTypes: e,
      })
    );
  })
);

app.get(
  '/equipments',
  asyncRequestHandler(async (req, res) => {
    res.send(await getEquipmentTemplateList());
  })
);

module.exports = app;
