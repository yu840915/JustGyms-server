const express = require('express');
const app = express();

app.use('/gyms', require('../gym').routes);

app.use('/geocode', require('../geocode').routes);

app.use('/me', require('../user/me').routes);

app.use('/users', require('../user').routes);

app.get('/url', (req, res) =>
  res.send(require('../storage/upload').generateUploadUrl())
);

app.use(async (err, req, res, next) => {
  /**
   * @type {Error}
   */
  const error = err;
  const code = err.statusCode || 500;
  if (code >= 400 && code < 500) {
    res.status(code).send({
      message: error.message,
    });
  } else {
    console.error(err);
    res.sendStatus(code);
  }
});

module.exports = app;
