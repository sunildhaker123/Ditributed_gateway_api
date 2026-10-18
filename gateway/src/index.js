const app = require("./app");
const checkServices = require("./utils/healthChecker");

setInterval(() => {
  checkServices();
}, 10000);

app.listen(4000, () => {
  console.log("Gateway is running at http://localhost:4000");
});
