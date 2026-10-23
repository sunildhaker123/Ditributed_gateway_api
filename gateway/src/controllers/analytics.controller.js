const { getAnalyticsSummary } = require("../services/analytics.service");

async function analyticsSummaryController(req, res, next) {
  try {
    const result = await getAnalyticsSummary();
    return res.status(200).json({
      totalRequests: result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { analyticsSummaryController };
