const { getTotalRequests } = require("../repositories/analytics.repository");
async function getAnalyticsSummary() {
  return await getTotalRequests();
}
module.exports = { getAnalyticsSummary };
