const express = require('express');
const { errorHandlingMiddleware } = require('../firebaseFunctions');
const app = express();

app.use('/users', require('./user').routes);

app.use(errorHandlingMiddleware);

module.exports = app;
