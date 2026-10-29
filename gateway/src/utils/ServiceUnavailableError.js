class ServiceUnavailableError extends Error {
  constructor(message) {
    super(message);
    this.name = "ServiceUnavailableError";
    this.statusCode = 503;
  }
}

module.exports = ServiceUnavailableError;
