const express = require('express');
const { asyncRequestHandler } = require('../firebaseFunctions');
const { deleteAnonymousUserWithId } = require('./deleteUser');
const { firebaseAdmin } = require('./firestoreRefs');
const { authenticate } = require('../authenticate');

const validationRules = require('./validationRules');

const validator = require('express-joi-validation').createValidator({});
const app = express.Router();

app.delete(
  '/:anonymousId',
  validator.params(validationRules.anonymousId),
  authenticate,
  asyncRequestHandler(async (req, res) => {
    const { anonymousId } = req.params;
    deleteAnonymousUserWithId(anonymousId).catch(console.error);
    res.send(202);
  })
);

module.exports = app;
