const crypto = require("crypto");

async function generateApiKey() {
  return crypto.randomBytes(32).toString("hex");
}
async function hashApiKey(apiKey) {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}
module.exports = { generateApiKey, hashApiKey };
