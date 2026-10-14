const pool = require("./src/config/db");

async function testConnection() {
  try {
    const result = await pool.query("SELECT current_database(), current_user");
    console.log(result.rows[0]);
  } catch (err) {
    console.error("Database connection failed:", err.message);
  } finally {
    await pool.end();
  }
}

testConnection();
