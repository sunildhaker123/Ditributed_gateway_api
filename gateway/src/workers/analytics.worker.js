const { Worker, UnrecoverableError } = require("bullmq");
const connection = require("../config/redis");
const pool = require("../config/db");
const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

const analyticWorker = new Worker(
  "analytics",
  async (job) => {
    console.log("Job data:", job.data);
    console.log("Worker file:", __filename);
    const event = job.data;
    const errors = [];
    if (typeof event !== "object" || event === null || Array.isArray(event)) {
      throw new Error("event must be an object");
    }
    if (!Object.hasOwn(event, "apiKeyId")) {
      errors.push("apiKeyId is required (it can be null)");
    } else if (
      event.apiKeyId !== null &&
      (!Number.isInteger(event.apiKeyId) || event.apiKeyId <= 0)
    ) {
      errors.push("apiKeyId must be a positive integer or null");
    }

    if (
      typeof event.timestamp !== "string" ||
      Number.isNaN(Date.parse(event.timestamp))
    ) {
      errors.push("timestamp must be a valid date string");
    }

    if (!METHODS.includes(event.method)) {
      errors.push(`method must be one of: ${METHODS.join(", ")}`);
    }

    if (typeof event.path !== "string" || !event.path.startsWith("/")) {
      errors.push('path must be a string that starts with "/"');
    }
    if (
      !Number.isInteger(event.statusCode) ||
      event.statusCode < 100 ||
      event.statusCode > 599
    ) {
      errors.push("statusCode must be an integer from 100 to 599");
    }

    if (
      typeof event.latencyMs !== "number" ||
      !Number.isFinite(event.latencyMs) ||
      event.latencyMs < 0
    ) {
      errors.push("latencyMs must be a number >= 0");
    }
    if (errors.length > 0) {
      throw new UnrecoverableError(
        `Invalid analytics event: ${errors.join("; ")}`,
      );
    }
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
  },
  {
    connection,
  },
);
analyticWorker.on("completed", (job) => {
  console.log(`Analytics job ${job.id} completed`);
});

analyticWorker.on("failed", (job, err) => {
  console.error(`Analytics job ${job?.id} failed:`, err.message);
});
module.exports = analyticWorker;
