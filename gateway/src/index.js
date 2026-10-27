const app = require("./app");
const checkServices = require("./utils/healthChecker");
const eventLoopMonitor = require("./utils/eventLoopMonitor");
const analyticsQueueMonitor = require("./utils/analyticsQueueMonitor");
const redis = require("./config/redis");
const pool = require("./config/db");

const monitorInterval = setInterval(() => {
  checkServices();
  console.log(
    "Event loop p99 delay:",
    (eventLoopMonitor.percentile(99) / 1e6).toFixed(2),
    "ms",
  );
  analyticsQueueMonitor();
}, 10000);

const server = app.listen(4000, () => {
  console.log("Gateway is running at http://localhost:4000");
});

// graceful shutdown and it is very inportant
const shutdown = () => {
  console.log("Shutdown requested");

  clearInterval(monitorInterval);

  server.close(async () => {
    console.log("HTTP server closed");
    try {
      await redis.quit();
      console.log("Redis connection closed");
    } catch (err) {
      console.error("Redis cleanup failed:", err.message);
    }

    try {
      await pool.end();
      console.log("PostgreSQL pool closed");
    } catch (err) {
      console.error("PostgreSQL cleanup failed:", err.message);
    }
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
