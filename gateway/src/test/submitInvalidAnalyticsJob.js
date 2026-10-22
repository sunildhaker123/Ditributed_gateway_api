const analyticsQueue = require("../config/analyticsQueue");

async function submitInvalidJob() {
  try {
    const job = await analyticsQueue.add(
      "request-event",
      {
        apiKeyId: 2,
        statusCode: 200,
        // Intentionally missing timestamp, method, path, and latencyMs
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
      },
    );

    console.log("Submitted invalid test job:", job.id);
  } catch (err) {
    console.error("Failed to submit test job:", err.message);
  } finally {
    await analyticsQueue.close();
  }
}

submitInvalidJob();
// const { Queue } = require("bullmq");
// const connection = require("../config/redis");

// async function inspectQueue() {
//   const queue = new Queue("analytics", { connection });

//   try {
//     const job = await queue.getJob("64");

//     if (!job) {
//       console.log("Job 64 was not found in the queue.");
//       return;
//     }

//     console.log("Job ID:", job.id);
//     console.log("Job data:", job.data);
//     console.log("Job state:", await job.getState());
//     console.log("Failed reason:", job.failedReason);
//     console.log("Attempts made:", job.attemptsMade);
//   } catch (err) {
//     console.error("Queue inspection failed:", err.message);
//   } finally {
//     await queue.close();
//     await connection.quit();
//   }
// }

// inspectQueue();
