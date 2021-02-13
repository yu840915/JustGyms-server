const express = require('express');
const app = express();

app.use('/gyms', require('../gym').routes);

module.exports = app;
