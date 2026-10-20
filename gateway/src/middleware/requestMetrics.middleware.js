const { performance } = require("node:perf_hooks");
const buildRequestEvent = require("../utils/buildRequestEvent");
const analyticsQueue = require("../config/analyticsQueue");
function requestMetrics(req, res, next) {
  const reqStartTime = performance.now();
  res.on("finish", async () => {
    const reqEndTime = performance.now();
    const event = buildRequestEvent(req, res, reqStartTime, reqEndTime);
    try {
      await analyticsQueue.add("request-event", event);
    } catch (err) {
      console.error("Failed to enqueue request analytics:", err.message);
    }
  });
  return next();
}
module.exports = requestMetrics;
