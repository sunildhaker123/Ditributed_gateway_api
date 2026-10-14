const pool = require("../config/db");
const { hashApiKey } = require("../utils/apiKey");
const {
  findActiveApiKeyByHash,
} = require("../repositories/apiKey.repositories");
async function authMiddleware(req, res, next) {
  try {
    const apiKeyValue = req.headers["x-api-key"];
    if (!apiKeyValue) {
      return res.status(401).json({
        error: "API key is required",
      });
    }
    const apiKeyHash = await hashApiKey(apiKeyValue);
    console.log("Computed hash:", apiKeyHash);
    const apiKeyRecord = await findActiveApiKeyByHash(pool, apiKeyHash);
    if (!apiKeyRecord)
      return res.status(401).json({
        error: "Invalid or inactive API key",
      });
    req.apiKey = apiKeyRecord;
    await pool.query("UPDATE api_keys SET last_used_at = NOW() WHERE id = $1", [
      apiKeyRecord.id,
    ]);
    return next();
  } catch (err) {
    next(err);
  }
}
module.exports = authMiddleware;
