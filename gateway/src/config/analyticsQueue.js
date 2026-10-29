const { Queue } = require("bullmq");
const rateLimitRedis = require("./rateLimitRedis");
const analytics = new Queue("analytics", { rateLimitRedis });

module.exports = analytics;
