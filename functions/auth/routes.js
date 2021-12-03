const express = require('express');
const { asyncRequestHandler } = require('../firebaseFunctions');
const validationRules = require('./validationRules');
const validator = require('express-joi-validation').createValidator({});
const { logInWithEmailPassword } = require('./passwordAuth');
const app = express.Router();

app.post(
  '/email',
  validator.body(validationRules.emailAuth),
  asyncRequestHandler(async (req, res) => {
    const { email, password } = req.body;
    const token = await logInWithEmailPassword(email, password);
    if (token) {
      res.send({ idToken: token });
    } else {
      res.status(401).send({ error: 'Wrong email or password' });
    }
  })
);

module.exports = app;
