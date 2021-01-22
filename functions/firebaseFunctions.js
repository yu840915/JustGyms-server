const functions = require("firebase-functions");
const region = "us-central1";

const functionWithTimeout = (timeoutSeconds) => {
  return functions.region(region).runWith(timeoutSeconds);
};

module.exports = {
  functions: functions.region(region),
  functionWithTimeout,
};
