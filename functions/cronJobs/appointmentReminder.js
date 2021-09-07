const { functions } = require('../firebaseFunctions');
const { remindForNearAppointments } = require('../gym/bookingReminder');

module.exports = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async () => {
    await remindForNearAppointments().catch(console.error);
  });
