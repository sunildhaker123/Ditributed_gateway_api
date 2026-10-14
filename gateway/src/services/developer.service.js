const pool = require("../config/db");
const bcrypt = require("bcrypt");
const { createApiKey } = require("../repositories/apiKey.repositories");
const {
  createDeveloper,
  findDeveloperByEmail,
} = require("../repositories/developer.repository");
const findPlan = require("../repositories/plan.repository");
const { generateApiKey, hashApiKey } = require("../utils/apiKey");

async function registerDeveloper({ name, email, password }) {
  // check if email exists ->if Yes send a response that email already exists
  email = email.trim().toLowerCase();
  const existingDeveloper = await findDeveloperByEmail(pool, email);
  if (existingDeveloper) {
    const error = new Error("Developer already exists");
    error.statusCode = 409;
    throw error;
  }

  const freePlan = await findPlan("Free");
  if (!freePlan) {
    throw new Error("Free plan not found");
  }
  // hash the password using bcrypt or any other method
  const password_hash = await bcrypt.hash(password, 12);

  // generate a api key
  const apiKey = await generateApiKey();
  const hashedKey = await hashApiKey(apiKey);
  let client;
  try {
    client = await pool.connect();
    await client.query("begin");
    const developerId = await createDeveloper(client, {
      name,
      email,
      password_hash,
    });
    await createApiKey(client, {
      developerId,
      planId: freePlan.id,
      keyHash: hashedKey,
    });
    await client.query("commit");
  } catch (err) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError.message);
      }
    }

    throw err;
  } finally {
    if (client) client.release();
  }
  return { apiKey };
}
module.exports = registerDeveloper;
