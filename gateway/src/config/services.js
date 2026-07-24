const services = new Map();

services.set("/users", {
  target: "http://localhost:4001",
  healthy: true,
});

services.set("/notification", {
  target: "http://localhost:4002",
  healthy: true,
});

services.set("/payment", {
  target: "http://localhost:4003",
  healthy: true,
});
module.exports = services;
