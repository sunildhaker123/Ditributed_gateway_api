const registerDeveloper = require("../services/developer.service");
async function developerController(req, res) {
  const data = req.body;
  try {
    const { apiKey } = await registerDeveloper({
      name: data.name,
      email: data.email,
      password: data.password,
    });
    return res.status(201).json({
      apiKey,
    });
  } catch (err) {
    console.error(err);
    return res.status(err.statusCode || 500).json({
      error: err.message,
    });
  }
}
module.exports = developerController;
