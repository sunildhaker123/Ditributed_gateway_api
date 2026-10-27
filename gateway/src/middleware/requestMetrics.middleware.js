const { performance } = require("node:perf_hooks");
const buildRequestEvent = require("../utils/buildRequestEvent");
const analyticsQueue = require("../config/analyticsQueue");
const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
function requestMetrics(req, res, next) {
  const reqStartTime = performance.now();
  res.on("finish", async () => {
    const reqEndTime = performance.now();
    const event = buildRequestEvent(req, res, reqStartTime, reqEndTime);

    const errors = [];

    if (typeof event !== "object" || event === null || Array.isArray(event)) {
      console.log("event must be an object");
      return;
    }
    if (!Object.hasOwn(event, "apiKeyId")) {
      errors.push("apiKeyId is required (it can be null)");
    } else if (
      event.apiKeyId !== null &&
      (!Number.isInteger(event.apiKeyId) || event.apiKeyId <= 0)
    ) {
      errors.push("apiKeyId must be a positive integer or null");
    }

    if (
      typeof event.timestamp !== "string" ||
      Number.isNaN(Date.parse(event.timestamp))
    ) {
      errors.push("timestamp must be a valid date string");
    }

    if (!METHODS.includes(event.method)) {
      errors.push(`method must be one of: ${METHODS.join(", ")}`);
    }

    if (typeof event.path !== "string" || !event.path.startsWith("/")) {
      errors.push('path must be a string that starts with "/"');
    }
    if (
      !Number.isInteger(event.statusCode) ||
      event.statusCode < 100 ||
      event.statusCode > 599
    ) {
      errors.push("statusCode must be an integer from 100 to 599");
    }

    if (
      typeof event.latencyMs !== "number" ||
      !Number.isFinite(event.latencyMs) ||
      event.latencyMs < 0
    ) {
      errors.push("latencyMs must be a number >= 0");
    }
    if (errors.length > 0) {
      console.log(errors);
      return;
    }
    try {
      await analyticsQueue.add("request-event", event, {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
        removeOnFail: {
          count: 500,
        },
      });
    } catch (err) {
      console.error("Failed to enqueue request analytics:", err.message);
    }
  });
  return next();
}
module.exports = requestMetrics;
