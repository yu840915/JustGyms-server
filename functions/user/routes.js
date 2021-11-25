const express = require('express');
const { asyncRequestHandler } = require('../firebaseFunctions');
const { deleteAnonymousUserWithId } = require('./deleteUser');
const { authenticate } = require('../authenticate');

const validationRules = require('./validationRules');
const { generateDownloadUrlForAvatar } = require('./avatar');

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

app.get(
  '/:userId',
  validator.params(validationRules.userId),
  asyncRequestHandler(async (req, res) => {
    const { userId } = req.params;
    const url = await generateDownloadUrlForAvatar({ userId });
    res.setHeader('Location', url);
    res.sendStatus(302);
  })
);

module.exports = app;
