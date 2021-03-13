/**
 *
 * @param {Number} code
 * @param {String} message
 * @returns
 */
const createClientError = (code, message) => {
  const err = new Error(message);
  err.statusCode = code;
  return err;
};

module.exports = { createClientError };
