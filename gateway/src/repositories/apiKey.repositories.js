async function createApiKey(db, data) {
  const query = `insert into api_keys(developer_id,plan_id,key_hash)
    values($1,$2,$3);
  `;
  const result = await db.query(query, [
    data.developerId,
    data.planId,
    data.keyHash,
  ]);
  return result;
}
async function findActiveApiKeyByHash(db, hashedKey) {
  const query = `select * from api_keys where key_hash = $1 and is_active = TRUE`;
  const result = await db.query(query, [hashedKey]);
  return result.rows[0];
}
module.exports = { createApiKey, findActiveApiKeyByHash };
