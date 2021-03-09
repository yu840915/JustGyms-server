const express = require('express');
const app = express();

app.use('/gyms', require('../gym').routes);

app.get('/url', (req, res) =>
  res.send(require('../storage/upload').generateUploadUrl())
);

module.exports = app;
