const express = require('express');
const validator = require('express-joi-validation').createValidator({});
const validationRules = require('./validationRules');
const { addressSearch } = require('./geocoding');
const { asyncRequestHandler } = require('../firebaseFunctions');
const { formatAddressSearchResult } = require('./formatters');
const { authenticate } = require('../authenticate');

const app = express.Router();

app.get(
  '/search',
  validator.query(validationRules.search),
  authenticate,
  asyncRequestHandler(async (req, res) => {
    const { q, country } = req.query;
    const language = req.headers['content-language'];
    const results = await addressSearch({ address: q, language, country });
    res.send(results.map(formatAddressSearchResult));
  })
);

module.exports = app;
