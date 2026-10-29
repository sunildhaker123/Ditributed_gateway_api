function errorHandler(err, req, res, next) {
  console.error("Request failed:", err);
  console.log({
    name: err.name,
    message: err.message,
    statusCode: err.statusCode,
  });
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    error: statusCode === 503 ? "Service Unavailable" : "Internal Server Error",
    message:
      statusCode === 503
        ? "A required service is temporarily unavailable"
        : "Something went wrong",
  });
}

module.exports = errorHandler;
