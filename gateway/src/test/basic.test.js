const {
  getSecondsUntilNextMinute,
  getSecondsUntilNextDay,
} = require("../services/rateLimitCounter.service");
jest.mock("../config/redis", () => ({}));

describe("Rate limit window TTL", () => {
  test("calculates seconds until the next UTC minute", () => {
    const date = new Date("2026-10-18T10:14:42Z");

    expect(getSecondsUntilNextMinute(date)).toBe(18);
  });

  test("calculates seconds until the next UTC day", () => {
    const date = new Date("2026-10-18T23:59:50Z");

    expect(getSecondsUntilNextDay(date)).toBe(10);
  });
});
