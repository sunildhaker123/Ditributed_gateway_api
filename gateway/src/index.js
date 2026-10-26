const app = require("./app");
const checkServices = require("./utils/healthChecker");
const eventLoopMonitor = require("./utils/eventLoopMonitor");
const analyticsQueueMonitor = require("./utils/analyticsQueueMonitor");
setInterval(() => {
  checkServices();
  console.log(
    "Event loop p99 delay:",
    (eventLoopMonitor.percentile(99) / 1e6).toFixed(2),
    "ms",
  );
  analyticsQueueMonitor();
}, 10000);

app.listen(4000, () => {
  console.log("Gateway is running at http://localhost:4000");
});
