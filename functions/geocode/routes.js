const express = require('express');
const validator = require('express-joi-validation').createValidator({});
const validationRules = require('./validationRules');
const { geocode } = require('./geocoding');
const { asyncRequestHandler } = require('../firebaseFunctions');

const app = express.Router();

app.get(
  '',
  validator.query(validationRules.geocode),
  asyncRequestHandler(async (req, res) => {
    const { q } = req.query;
    res.send(await geocode(q));
  })
);

module.exports = app;