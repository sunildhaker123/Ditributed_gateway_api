const client = require("../config/redis");

async function incrementRequestCount(redisKey) {
  const count = await client.incr(redisKey);
  if (count == 1) {
    let ttl = getSecondsUntilNextMinute(new Date());
    await client.expire(redisKey, ttl);
  }
  return count;
}
function buildRateLimitKey(apiKeyId, windowType, windowStart) {
  return `ratelimit:api_key:${apiKeyId}:${windowType}:${windowStart}`;
}

const date = new Date();
const windowStart =
  date.getFullYear() +
  "-" +
  String(date.getMonth() + 1).padStart(2, "0") +
  "-" +
  String(date.getDate()).padStart(2, "0") +
  "T" +
  String(date.getHours()).padStart(2, "0") +
  ":" +
  String(date.getMinutes()).padStart(2, "0");
// (async function () {
//   const rateLimitKey = buildRateLimitKey(1, "minute", windowStart);
//   const result = await incrementRequestCount(rateLimitKey);
//   console.log(result);
//   const time = await client.ttl(rateLimitKey);
//   console.log(time);
//   await client.quit();
// })();
function getSecondsUntilNextMinute(currentTime) {
  const seconds = currentTime.getSeconds();
  return 60 - seconds;
}
async function getCurrentValuOfCounter(redisKey) {
  return Number(await client.get(redisKey)) || 0;
}
// let a = getSecondsUntilNextMinute(date);
// console.log(a);
// (async function () {
//   try {
//     const redisKey = buildRateLimitKey(1, "minute", windowStart);
//     console.log("Before increment");

//     const result = await incrementRequestCount(redisKey);

//     console.log("After increment:", result);

//     console.log("Redis Count:", result); // This will now log successfully
//   } catch (error) {
//     console.error("Redis Error:", error);
//   } finally {
//     // 2. Disconnect so Node can cleanly exit the terminal
//     await client.quit();
//   }
// })();
module.exports = {
  incrementRequestCount,
  buildRateLimitKey,
  getSecondsUntilNextMinute,
  getCurrentValuOfCounter,
};
