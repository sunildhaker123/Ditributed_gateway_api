require("dotenv").config();
const Redis = require("ioredis");

const rateLimitRedis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  connectTimeout: 1000,
});
rateLimitRedis.on("connect", () => {
  console.log("Redis connected successfully");
});
module.exports = rateLimitRedis;
