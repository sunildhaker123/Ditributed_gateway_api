const pool = require("../config/db");

async function findPlan(planType) {
  const result = await pool.query("select * from plans where name = $1", [
    planType,
  ]);
  return result.rows[0];
}
module.exports = findPlan;
