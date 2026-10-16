// const pool = require("./src/config/db");

// async function testConnection() {
//   try {
//     const result = await pool.query("SELECT current_database(), current_user");
//     console.log(result.rows[0]);
//   } catch (err) {
//     console.error("Database connection failed:", err.message);
//   } finally {
//     await pool.end();
//   }
// }

// testConnection();
const { getRateLimits } = require("./src/services/rateLimit.service");

async function test() {
  try {
    const limits = await getRateLimits(1);
    console.log(limits);
  } catch (err) {
    console.error(err.message);
  }
}

test();
