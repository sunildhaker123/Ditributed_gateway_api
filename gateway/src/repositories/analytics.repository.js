const pool = require("../config/db");

async function getTotalRequests() {
  const query = `select count(*) as total_requests from request_analytics`;
  const result = await pool.query(query);
  return result.rows[0].total_requests;
}
module.exports = { getTotalRequests };
