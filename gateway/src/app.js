const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const services = require("./config/services");
const developerController = require("./controllers/developer.controller");
const protectedRouter = require("./routers/protected.router");
const authMiddleware = require("./middleware/auth.middleware");
const { rateLimiter } = require("./middleware/rateLimiter.middleware");
const requestMetrics = require("./middleware/requestMetrics.middleware");
const { analyticsRouter } = require("./routers/analytics.router");

const app = express();

app.use(express.json());

for (const [route, service] of services) {
  app.use(
    route,
    createProxyMiddleware({
      target: service.target,
      changeOrigin: true,
    }),
  );
}

app.use(
  "/protected",
  requestMetrics,
  authMiddleware,
  rateLimiter,
  protectedRouter,
);
app.use("/summary", analyticsRouter);
app.post("/register", developerController);

module.exports = app;
