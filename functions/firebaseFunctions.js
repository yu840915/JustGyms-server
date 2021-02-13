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

module.exports = {
  functions: functions.region(region),
  functionWithTimeout,
  asyncRequestHandler,
};
