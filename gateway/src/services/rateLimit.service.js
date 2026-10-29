const pool = require("../config/db");
const findLimitsByPlanId = require("../repositories/rateLimit.repository");
const ServiceUnavailableError = require("../utils/ServiceUnavailableError");
async function getRateLimits(planId) {
  let limits;
  try {
    limits = await findLimitsByPlanId(pool, planId);
  } catch (err) {
    throw new ServiceUnavailableError(
      "Unable to retrieve rate-limit configuration",
    );
  }

  if (limits.length === 0) {
    throw new Error(`No rate limits configured for plan ${planId}`);
  }

  return limits;
}
module.exports = { getRateLimits };
