const pool = require("../config/db");

async function getTotalRequests(from, to) {
  let query = `
    SELECT
      COUNT(*) AS total_requests,
      AVG(latency_ms) AS average_latency_ms,
      PERCENTILE_CONT(0.50) WITHIN GROUP (
  ORDER BY latency_ms
) AS p50_latency_ms,

PERCENTILE_CONT(0.95) WITHIN GROUP (
  ORDER BY latency_ms
) AS p95_latency_ms,

PERCENTILE_CONT(0.99) WITHIN GROUP (
  ORDER BY latency_ms
) AS p99_latency_ms,
      COUNT(*) FILTER (
        WHERE status_code >= 200 AND status_code < 300
      ) AS success_requests,
      COUNT(*) FILTER (
        WHERE status_code >= 300 AND status_code < 400
      ) AS redirect_requests,
      COUNT(*) FILTER (
        WHERE status_code >= 400 AND status_code < 500
      and status_code != 429) AS client_errors,
       COUNT(*) FILTER (
        WHERE status_code = 429) AS rate_limit_errors,
      COUNT(*) FILTER (
        WHERE status_code >= 500
      ) AS server_errors
    FROM request_analytics
  `;

  const values = [];

  if (from && to) {
    query += `WHERE timestamp >= $1 AND timestamp < $2`;
    values.push(from, to);
  }

  const result = await pool.query(query, values);
  return result.rows[0];
}

module.exports = { getTotalRequests };
