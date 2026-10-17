(async function () {
//   try {
//     const redisKey = buildRateLimitKey(1, "minute", windowStart);
//     console.log("Before increment");

//     const result = await incrementRequestCount(redisKey);

//     console.log("After increment:", result);

//     console.log("Redis Count:", result); // This will now log successfully
//   } catch (error) {
//     console.error("Redis Error:", error);
//   } finally {
//     // 2. Disconnect so Node can cleanly exit the terminal
//     await client.quit();
//   }
// })();