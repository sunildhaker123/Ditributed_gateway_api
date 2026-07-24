const express = require("express");
const app = express();
app.get("/payment", (req, res) => {
  return res.json({
    service: "payment",
    message: "payment received",
  });
});
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    service: "user-service",
  });
});
app.listen(4003, () => {
  console.log("server is listening at http://localhost:4003/");
});
