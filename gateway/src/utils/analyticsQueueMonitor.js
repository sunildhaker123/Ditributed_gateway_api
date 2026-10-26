const analytics = require("../config/analyticsQueue");
let counter = 0;
async function analyticsQueueMonitor() {
  const obj = await analytics.getJobCounts();
  console.log({
    waiting: obj.waiting,
    active: obj.active,
    completed: obj.completed,
    failed: obj.failed,
  });
  if (obj.waiting > 5) {
    counter++;
  } else {
    counter = 0;
  }
  if (counter > 3) {
    console.warn(
      `Analytics queue backlog detected: ${obj.waiting} jobs waiting`,
    );
  }
}
module.exports = analyticsQueueMonitor;
