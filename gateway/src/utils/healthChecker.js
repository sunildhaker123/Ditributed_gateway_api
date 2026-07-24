const services = require("../config/services");
const axios = require("axios");
async function checkServices() {
  for (const [route, service] of services) {
    const previousState = service.healthy;

    try {
      await axios.get(`${service.target}/health`);

      service.healthy = true;

      if (previousState !== service.healthy) {
        console.log(`${route} changed: DOWN -> UP`);
      }
    } catch (err) {
      service.healthy = false;

      if (previousState !== service.healthy) {
        console.log(`${route} changed: UP -> DOWN`);
      }
    }
  }
}
module.exports = checkServices;
