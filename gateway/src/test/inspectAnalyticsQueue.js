const { Queue } = require("bullmq");
const connection = require("../config/redis");

async function inspectQueue() {
  const queue = new Queue("analytics", { connection });

  try {
    const job = await queue.getJob("76");

    if (!job) {
      console.log("Job 76 was not found in the queue.");
      return;
    }

    console.log("Job ID:", job.id);
    console.log("Job state:", await job.getState());
    console.log("Failed reason:", job.failedReason);
    console.log("Attempts made:", job.attemptsMade);
  } catch (err) {
    console.error("Queue inspection failed:", err.message);
  } finally {
    await queue.close();
    await connection.quit();
  }
}

inspectQueue();
