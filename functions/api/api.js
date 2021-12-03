const express = require('express');
const { errorHandlingMiddleware } = require('../firebaseFunctions');
const app = express();

app.use('/gyms', require('../gym').routes);

app.use('/geocode', require('../geocode').routes);

app.use('/me', require('../user/me').routes);

app.use('/users', require('../user').routes);

app.use('/auth', require('../auth').routes);

app.get('/url', (req, res) =>
  res.send(require('../storage/upload').generateUploadUrl())
);

app.use(errorHandlingMiddleware);

module.exports = app;
