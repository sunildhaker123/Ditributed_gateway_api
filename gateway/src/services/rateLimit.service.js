const pool = require("../config/db");
const findLimitsByPlanId = require("../repositories/rateLimit.repository");
async function getRateLimits(planId) {
  const limits = await findLimitsByPlanId(pool, planId);

  if (limits.length === 0) {
    throw new Error(`No rate limits configured for plan ${planId}`);
  }

  return limits;
}
module.exports = { getRateLimits };
