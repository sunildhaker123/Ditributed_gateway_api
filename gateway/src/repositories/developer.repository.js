async function createDeveloper(db, { name, email, password_hash }) {
  const query = `
    INSERT INTO developers
        (name, email, password_hash)
    VALUES
        ($1, $2, $3)
    RETURNING id;
`;
  const result = await db.query(query, [name, email, password_hash]);
  return result.rows[0].id;
}
async function findDeveloperByEmail(db, email) {
  const result = await db.query(
    "SELECT id, email FROM developers WHERE email = $1",
    [email],
  );
  return result.rows[0];
}
module.exports = {
  createDeveloper,
  findDeveloperByEmail,
};
