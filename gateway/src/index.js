const express = require("express");
const app = express();
const { createProxyMiddleware } = require("http-proxy-middleware");
const services = require("./config/services");
const checkServices = require("./utils/healthChecker");
setInterval(() => {
  checkServices();
}, 10000);
for (const [route, service] of services) {
  app.use(
    route,
    createProxyMiddleware({
      target: service.target,
      changeOrigin: true,
    }),
  );
}
app.listen(4000, () => {
  console.log(`gateway is running at http://localhost:4000`);
});
