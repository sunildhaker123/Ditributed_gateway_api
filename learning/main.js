// const path = require("node:path");
// const { Worker } = require("node:worker_threads");
// const { performance } = require("node:perf_hooks");
// console.log(__dirname);
// const worker = new Worker(path.join(__dirname, "worker.js"));

// // Send the task to the worker
// worker.postMessage(100_000_000_00);

// // Receive the result
// const startTime = performance.now();
// worker.on("message", (result) => {
//   console.log("Calculation result:", result);
//   console.log(performance.now() - startTime);
// });

// console.log("Main thread can handle other work!");
const eventLoopMonitor = require("../gateway/src/utils/eventLoopMonitor");
function cpuIntesivework() {
  const start = performance.now();

  for (let i = 1; i <= 1_000_000_000; i++) {}

  console.log(
    "CPU work duration:",
    (performance.now() - start).toFixed(2),
    "ms",
    "| Max:",
    (eventLoopMonitor.max / 1e6).toFixed(2),
    "ms",
  );
}
setInterval(() => {
  cpuIntesivework();
}, 400);

setInterval(() => {
  console.log(
    "Event loop p99 delay:",
    (eventLoopMonitor.percentile(99) / 1e6).toFixed(2),
    "ms",
  );
}, 2000);
