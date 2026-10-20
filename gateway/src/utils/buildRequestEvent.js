function buildRequestEvent(req, res, startTime, endTime) {
  const event = {
    apiKeyId: req.apiKey?.id ?? null,
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    statusCode: res.statusCode,
    latencyMs: endTime - startTime,
  };
  return event;
}
module.exports = buildRequestEvent;
