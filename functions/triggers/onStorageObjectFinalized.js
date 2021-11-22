const functions = require('firebase-functions');
const { updateVisibility } = require('../storage/upload');

module.exports = functions.storage.object().onFinalize(updateVisibility);
