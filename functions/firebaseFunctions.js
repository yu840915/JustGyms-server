const functions = require('firebase-functions');
const region = 'us-central1';

const functionWithTimeout = (timeoutSeconds) => {
  return functions.region(region).runWith(timeoutSeconds);
};

/**
 * @param {import('express').RequestHandler} fn
 */
const asyncRequestHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const errorHandlingMiddleware = async (err, req, res, next) => {
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
};

module.exports = {
  functions: functions.region(region),
  functionWithTimeout,
  asyncRequestHandler,
  errorHandlingMiddleware,
};
