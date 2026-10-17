const {
  incrementRequestCount,
  buildRateLimitKey,
  getSecondsUntilNextMinute,
  getCurrentValuOfCounter,
} = require("../services/rateLimitCounter.service");
const { getRateLimits } = require("../services/rateLimit.service");

const rateLimiter = async (req, res, next) => {
  const apiKeyRecord = req.apiKey;
  const planId = apiKeyRecord.plan_id;
  let limits;
  try {
    limits = await getRateLimits(planId);
    const match = limits.find((limit) => limit.window_type === "MINUTE");
    if (!match) {
      return res.status(503).json({
        error: "Service Unavailable",
        message: "Rate limits are not configured for this plan",
      });
    }
    const maxRequestLimit = match.request_limit;
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
    const redisKey = buildRateLimitKey(
      req.apiKey.id,
      match.window_type,
      windowStart,
    );
    const currCountVal = await getCurrentValuOfCounter(redisKey);

    if (currCountVal >= maxRequestLimit) {
      return res.status(429).json({
        error: "Too many requests",
        message: "Request limit reached",
      });
    }
    await incrementRequestCount(redisKey);
    return next();
  } catch (err) {
    return next(err);
  }
};
(async function () {})();
module.exports = { rateLimiter };
