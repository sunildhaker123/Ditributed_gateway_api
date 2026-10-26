const { getAnalyticsSummary } = require("../services/analytics.service");

function isValidDate(date) {
  return date instanceof Date && !isNaN(date.valueOf());
}
async function analyticsSummaryController(req, res, next) {
  try {
    const hasFrom = Object.hasOwn(req.query, "from");
    const hasTo = Object.hasOwn(req.query, "to");

    // console.log("Raw from:", req.query.from);
    // console.log("Raw to:", req.query.to);

    // Both dates must be provided together
    if (hasFrom !== hasTo) {
      return res.status(400).json({
        error: "Both 'from' and 'to' parameters are required together",
      });
    }

    let fromDate = null;
    let toDate = null;

    // Validate dates only when both are provided
    if (hasFrom && hasTo) {
      fromDate = new Date(req.query.from);
      toDate = new Date(req.query.to);

      if (!isValidDate(fromDate) || !isValidDate(toDate)) {
        return res.status(400).json({
          error: "Please provide valid dates",
        });
      }

      if (fromDate >= toDate) {
        return res.status(400).json({
          error: "'from' must be earlier than 'to'",
        });
      }
    }

    const result = await getAnalyticsSummary(fromDate, toDate);

    return res.status(200).json({
      totalRequests: result.total_requests,
      averageLatencyMs: result.average_latency_ms,
      p50LatencyMs: result.p50_latency_ms,
      p95LatencyMs: result.p95_latency_ms,
      p99LatencyMs: result.p99_latency_ms,
      successRequests: result.success_requests,
      redirectRequests: result.redirect_requests,
      serverErrors: result.server_errors,
      clientErrors: result.client_errors,
      rateLimitErrors: result.rate_limit_errors,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { analyticsSummaryController };
