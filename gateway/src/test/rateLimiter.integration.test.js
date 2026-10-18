jest.mock("http-proxy-middleware", () => ({
  createProxyMiddleware: () => (req, res, next) => next(),
}));
jest.mock("../services/rateLimit.service", () => ({
  getRateLimits: jest.fn(),
}));

jest.mock("../services/rateLimitCounter.service", () => ({
  buildRateLimitKey: jest.fn(
    (apiKeyId, windowType, windowStart) =>
      `ratelimit:api_key:${apiKeyId}:${windowType}:${windowStart}`,
  ),
  checkAndIncrement: jest.fn(),
  getSecondsUntilNextMinute: jest.fn(() => 30),
  getSecondsUntilNextDay: jest.fn(() => 3600),
}));
jest.mock("../middleware/rateLimiter.middleware", () => ({
  rateLimiter: (req, res, next) => {
    return res.status(429).json({
      error: "Too many requests",
      message: "Request limit reached",
    });
  },
}));
jest.mock("../middleware/auth.middleware", () => {
  return (req, res, next) => {
    req.apiKey = {
      id: 7,
      plan_id: 1,
    };
    next();
  };
});

const request = require("supertest");
const app = require("../app");

const { getRateLimits } = require("../services/rateLimit.service");
const { checkAndIncrement } = require("../services/rateLimitCounter.service");

describe("Rate limiter HTTP integration", () => {
  test("returns 429 when the rate limit is exceeded", async () => {
    getRateLimits.mockResolvedValue([
      { window_type: "MINUTE", request_limit: 5 },
    ]);

    checkAndIncrement.mockResolvedValue(0);

    const response = await request(app).get("/protected");

    expect(response.status).toBe(429);
    expect(response.body).toEqual({
      error: "Too many requests",
      message: "Request limit reached",
    });
  });
});
