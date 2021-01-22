const { functions } = require("./firebaseFunctions");

functions.pubsub.schedule("00 00 * * *").onRun(async () => {
  console.log("hello");
});
