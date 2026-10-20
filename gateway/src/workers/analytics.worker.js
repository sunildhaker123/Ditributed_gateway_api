const { Worker } = require("bullmq");
const connection = require("../config/redis");
const pool = require("../config/db");
const analyticWorker = new Worker(
  "analytics",
  async (job) => {
    console.log("1. Job received:", job.id);
    const event = job.data;
    console.log("2. Event data:", event);
    const query = `insert into request_analytics(api_key_id,timestamp,
    method,path,status_code,latency_ms) values($1,$2,$3,$4,$5,$6) returning id;`;
    const result = await pool.query(query, [
      event.apiKeyId,
      event.timestamp,
      event.method,
      event.path,
      event.statusCode,
      event.latencyMs,
    ]);
    console.log("3. Database result:", result.rows);
  },
  { connection },
);
module.exports = analyticWorker;
