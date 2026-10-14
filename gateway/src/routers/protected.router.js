const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", authMiddleware, (req, res) => {
  return res.status(200).json({
    message: "API key authenticated successfully",
    apiKeyId: req.apiKey.id,
    developerId: req.apiKey.developer_id,
  });
});

module.exports = router;
