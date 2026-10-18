jest.mock("../services/rateLimitCounter.service", () => ({
  buildRateLimitKey: jest.fn(),
  checkAndIncrement: jest.fn(),
  getSecondsUntilNextMinute: jest.fn(),
  getSecondsUntilNextDay: jest.fn(),
}));

jest.mock("../services/rateLimit.service", () => ({
  getRateLimits: jest.fn(),
}));

const { rateLimiter } = require("../middleware/rateLimiter.middleware");
const { checkAndIncrement } = require("../services/rateLimitCounter.service");
const { getRateLimits } = require("../services/rateLimit.service");

describe("Rate limiter middleware", () => {
  test("returns 429 when the request limit is reached", async () => {
    getRateLimits.mockResolvedValue([
      { window_type: "MINUTE", request_limit: 5 },
    ]);

    checkAndIncrement.mockResolvedValue(0);

    const req = {
      apiKey: {
        id: 7,
        plan_id: 1,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    const next = jest.fn();

    await rateLimiter(req, res, next);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      error: "Too many requests",
      message: "Request limit reached",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("calls next when the request is within quota", async () => {
    getRateLimits.mockResolvedValue([
      { window_type: "MINUTE", request_limit: 5 },
    ]);

    checkAndIncrement.mockResolvedValue(1);

    const req = {
      apiKey: {
        id: 7,
        plan_id: 1,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    const next = jest.fn();

    await rateLimiter(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
