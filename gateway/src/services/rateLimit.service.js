const pool = require("../config/db");
const findLimitsByPlanId = require("../repositories/rateLimit.repository");
async function getRateLimits(planId) {
  const limits = await findLimitsByPlanId(pool, 1);

  if (limits.length === 0) {
    throw new Error(`No rate limits configured for plan ${planId}`);
  }

  return limits;
}
// (async function () {
//   const result = await getRateLimits(1);
//   console.log(result);
// })();

module.exports = { getRateLimits };
