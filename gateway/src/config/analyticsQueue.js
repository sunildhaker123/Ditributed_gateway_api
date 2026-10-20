const { Queue } = require("bullmq");
const connection = require("./redis");
const analytics = new Queue("analytics", { connection });

module.exports = analytics;
