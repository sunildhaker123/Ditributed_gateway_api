const {
  buildRateLimitKey,
  checkAndIncrement,
  getSecondsUntilNextMinute,
  getSecondsUntilNextDay,
} = require("../services/rateLimitCounter.service");
const { getRateLimits } = require("../services/rateLimit.service");
const ServiceUnavailableError = require("../utils/ServiceUnavailableError");

const rateLimiter = async (req, res, next) => {
  const apiKeyRecord = req.apiKey;
  const planId = apiKeyRecord.plan_id;
  const date = new Date();
  let limits;
  try {
    limits = await getRateLimits(planId);
    const windows = limits.map((limit) => {
      let windowStart, ttl;
      if (limit.window_type === "MINUTE") {
        windowStart =
          date.getUTCFullYear() +
          "-" +
          String(date.getUTCMonth() + 1).padStart(2, "0") +
          "-" +
          String(date.getUTCDate()).padStart(2, "0") +
          "T" +
          String(date.getUTCHours()).padStart(2, "0") +
          ":" +
          String(date.getUTCMinutes()).padStart(2, "0");
        ttl = getSecondsUntilNextMinute(date);
      } else if (limit.window_type === "DAY") {
        windowStart =
          date.getUTCFullYear() +
          "-" +
          String(date.getUTCMonth() + 1).padStart(2, "0") +
          "-" +
          String(date.getUTCDate()).padStart(2, "0");
        ttl = getSecondsUntilNextDay(date);
      }

      const redisKey = buildRateLimitKey(
        req.apiKey.id,
        limit.window_type,
        windowStart,
      );

      return {
        redisKey,
        limit: limit.request_limit,
        ttl,
      };
    });
    let currCountVal;

    try {
      currCountVal = await checkAndIncrement(windows);
    } catch (err) {
      throw new ServiceUnavailableError("Rate limiting service is unavailable");
    }
    if (currCountVal === 0) {
      return res.status(429).json({
        error: "Too many requests",
        message: "Request limit reached",
      });
    }
    return next();
  } catch (err) {
    return next(err);
  }
};

module.exports = { rateLimiter };
