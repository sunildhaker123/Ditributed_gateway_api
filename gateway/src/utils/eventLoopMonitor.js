const { monitorEventLoopDelay } = require("node:perf_hooks");

const eventLoopMonitor = monitorEventLoopDelay({
  resolution: 20,
});

eventLoopMonitor.enable();

module.exports = eventLoopMonitor;
