const express = require("express");
const app = express();
const { createProxyMiddleware } = require("http-proxy-middleware");
const services = require("./config/services");
const checkServices = require("./utils/healthChecker");
const developerController = require("./controllers/developer.controller");
const protectedRouter = require("./routers/protected.router");
const authMiddleware = require("./middleware/auth.middleware");
const { rateLimiter } = require("./middleware/rateLimiter.middleware");
const redis = require("./config/redis");
setInterval(() => {
  checkServices();
}, 10000);
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
app.use("/protected", authMiddleware, rateLimiter, protectedRouter);

app.post("/register", developerController);
app.listen(4000, () => {
  console.log(`gateway is running at http://localhost:4000`);
});
