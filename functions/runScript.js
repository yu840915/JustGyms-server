const { functions } = require('./firebaseFunctions');

module.exports = functions.pubsub.schedule('00 00 * * *').onRun(async () => {});
