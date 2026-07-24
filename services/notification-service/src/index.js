const express = require("express");
const app = express();
app.get("/notification", (req, res) => {
  return res.json({
    service: "Notification",
    message: "notification sent",
  });
});
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    service: "user-service",
  });
});
app.listen(4002, () => {
  console.log("server is listening at http://localhost:4002/");
});
