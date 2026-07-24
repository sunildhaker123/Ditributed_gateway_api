const express = require("express");
const app = express();
app.get("/users", (req, res) => {
  res.json({
    success: true,
    name: "sunil",
  });
});
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    service: "user-service",
  });
});
app.listen(4001, () => {
  console.log(`server is listening at http://localhost:4001`);
});
