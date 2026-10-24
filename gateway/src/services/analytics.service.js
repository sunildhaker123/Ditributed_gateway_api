const { getTotalRequests } = require("../repositories/analytics.repository");
async function getAnalyticsSummary(from, to) {
  return getTotalRequests(from, to);
}
module.exports = { getAnalyticsSummary };
