const express = require('express');
const { authenticate } = require('../../authenticate');
const { asyncRequestHandler } = require('../../firebaseFunctions');
const { addGyms, removeGyms } = require('./favorites');
const validationRules = require('./validationRules');

const validator = require('express-joi-validation').createValidator({});

const app = express.Router();

app.patch(
  '/favorites/gyms',
  validator.body(validationRules.addGyms),
  authenticate,
  asyncRequestHandler(async (req, res) => {
    const { gyms } = req.body;
    await addGyms(req.userRef, { gymIds: gyms });
    res.sendStatus(200);
  })
);

app.delete(
  '/favorites/gyms/:gymId',
  validator.params(validationRules.gymId),
  authenticate,
  asyncRequestHandler(async (req, res) => {
    const { gymId } = req.params;
    await removeGyms(req.userRef, { gymIds: [gymId] });
    res.sendStatus(204);
  })
);
