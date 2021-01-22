const fs = require("fs");
const { firestore, firebaseAdmin } = require("../firestore");

const updateCounties = async () => {};

const updateTowns = async () => {};

/**
 * @param {String} path
 */
const readFile = async (path) => {
  return new Promise((resolve, rejects) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        return rejects(err);
      }
      return resolve(data);
    });
  });
};
