async function findLimitsByPlanId(db, planId) {
  const query = `select * from plan_limits where plan_id = $1`;
  const result = await db.query(query, [planId]);
  return result.rows;
}
module.exports = findLimitsByPlanId;
