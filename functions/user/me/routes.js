const express = require('express');
const { authenticate } = require('../../authenticate');
const { asyncRequestHandler } = require('../../firebaseFunctions');
const { addGyms, removeGyms } = require('./favorites');
const { addFcmToken } = require('./fcmTokens');
const validationRules = require('./validationRules');

const validator = require('express-joi-validation').createValidator({});

const app = express.Router();

app.post(
  '/fcm-tokens',
  validator.body(validationRules.fcmToken),
  authenticate,
  asyncRequestHandler(async (req, res) => {
    const { token } = req.body;
    await addFcmToken({ userRef: req.userRef, token });
    res.sendStatus(201);
  })
);

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

module.exports = app;
