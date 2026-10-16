require("dotenv").config();
const Redis = require("ioredis");
console.log(process.env.REDIS_URL);
const redis = new Redis(process.env.REDIS_URL);

redis.on("connect", () => {
  console.log("Redis connected successfully");
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err.message);
});

module.exports = redis;
