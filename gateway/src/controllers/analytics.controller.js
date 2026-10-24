const { getAnalyticsSummary } = require("../services/analytics.service");
function isValidDate(date) {
  return (
    date instanceof Date && // 1. Confirms it's a Date object
    !isNaN(date.valueOf()) // 2. Confirms it has a valid numeric timestamp
  );
}

async function analyticsSummaryController(req, res, next) {
  try {
    const hasFrom = Object.hasOwn(req.query, "from");
    const hasTo = Object.hasOwn(req.query, "to");

    if (hasFrom !== hasTo) {
      return res.status(400).json({
        error: "Both 'from' and 'to' parameters are required together",
      });
    }
    const from = req.query.from;
    const to = req.query.to;
    const fromDate = new Date(from);
    const toDate = new Date(to);

    const isFromValid = isValidDate(fromDate);
    const isToValid = isValidDate(toDate);
    if (hasFrom && hasTo && (!isFromValid || !isToValid)) {
      return res.status(400).json({
        error: "Please provide valid dates",
      });
    }
    const result = await getAnalyticsSummary(req.query.from, req.query.to);
    return res.status(200).json({
      totalRequests: result.total_requests,
      averageLatencyMs: result.average_latency_ms,
      successRequests: result.success_requests,
      redirectRequests: result.redirect_requests,
      serverErrors: result.server_errors,
      clientErrors: result.client_errors,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { analyticsSummaryController };
