const express = require('express');
const { authenticate } = require('../authenticate');
const { asyncRequestHandler } = require('../firebaseFunctions');
const { deleteAnonymousUser } = require('./deleteUser');
const validationRules = require('./validationRules');

const validator = require('express-joi-validation').createValidator({});
const app = express.Router();

app.delete(
  '/:anonymousId',
  validator.body(validationRules.anonymousId),
  authenticate,
  asyncRequestHandler(async (req, res) => {
    const { anonymousId } = req.params;
    await deleteAnonymousUser(anonymousId);
    res.send(204);
  })
);

module.exports = app;
