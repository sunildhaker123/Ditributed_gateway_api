const analyticsQueue = require("../config/analyticsQueue");
let counter = 0;
async function analyticsQueueMonitor() {
  try {
    const obj = await analyticsQueue.getJobCounts();
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
    const failedJobs = await analyticsQueue.getJobs(["failed"], 0, 4);

    // for (const job of failedJobs) {
    //   console.log({
    //     jobId: job.id,
    //     failedReason: job.failedReason,
    //   });
    // }
  } catch (error) {
    console.error("Analytics queue monitoring failed:", error.message);
  }
}
module.exports = analyticsQueueMonitor;
