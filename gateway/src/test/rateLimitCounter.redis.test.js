jest.mock("../config/redis", () => {
  const Redis = require("ioredis");
  return new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379");
});

const redis = require("../config/redis");
const { checkAndIncrement } = require("../services/rateLimitCounter.service");

describe("Redis fixed-window rate limiter", () => {
  const testKey = `test:ratelimit:${process.pid}`;

  beforeEach(async () => {
    await redis.del(testKey);
  });

  test("rejects the request if either window has reached its limit", async () => {
    const minuteKey = `${testKey}:minute`;
    const dailyKey = `${testKey}:day`;

    const windows = [
      { redisKey: minuteKey, limit: 2, ttl: 60 },
      { redisKey: dailyKey, limit: 3, ttl: 120 },
    ];

    // Simulate the minute window already being full.
    await redis.set(minuteKey, 2, "EX", 60);

    const result = await checkAndIncrement(windows);

    expect(result).toBe(0);
    expect(Number(await redis.get(minuteKey))).toBe(2);
    expect(Number(await redis.get(dailyKey)) || 0).toBe(0);

    await redis.del(minuteKey, dailyKey);
  });

  test("rejects the request if the daily window is full", async () => {
    const minuteKey = `${testKey}:minute`;
    const dailyKey = `${testKey}:day`;

    const windows = [
      { redisKey: minuteKey, limit: 2, ttl: 60 },
      { redisKey: dailyKey, limit: 3, ttl: 120 },
    ];

    await redis.set(dailyKey, 3, "EX", 120);

    const result = await checkAndIncrement(windows);

    expect(result).toBe(0);
    expect(Number(await redis.get(minuteKey)) || 0).toBe(0);
    expect(Number(await redis.get(dailyKey))).toBe(3);

    await redis.del(minuteKey, dailyKey);
  });

  test("increments every window when all windows have capacity", async () => {
    const minuteKey = `${testKey}:minute`;
    const dailyKey = `${testKey}:day`;

    const windows = [
      { redisKey: minuteKey, limit: 2, ttl: 60 },
      { redisKey: dailyKey, limit: 3, ttl: 120 },
    ];

    const result = await checkAndIncrement(windows);

    expect(result).toBe(1);
    expect(Number(await redis.get(minuteKey))).toBe(1);
    expect(Number(await redis.get(dailyKey))).toBe(1);

    await redis.del(minuteKey, dailyKey);
  });

  test("does not exceed the limit under concurrent requests", async () => {
    const concurrentKey = `${testKey}:concurrent`;

    const windows = [{ redisKey: concurrentKey, limit: 5, ttl: 60 }];

    const results = await Promise.all(
      Array.from({ length: 20 }, () => checkAndIncrement(windows)),
    );

    const accepted = results.filter((result) => result === 1);
    const rejected = results.filter((result) => result === 0);
    const finalCount = Number(await redis.get(concurrentKey));

    expect(accepted).toHaveLength(5);
    expect(rejected).toHaveLength(15);
    expect(finalCount).toBe(5);

    await redis.del(concurrentKey);
  });

  test("sets a TTL when a counter is created", async () => {
    const ttlKey = `${testKey}:ttl`;

    const windows = [{ redisKey: ttlKey, limit: 5, ttl: 60 }];

    const result = await checkAndIncrement(windows);

    const count = Number(await redis.get(ttlKey));
    const remainingTtl = await redis.ttl(ttlKey);

    expect(result).toBe(1);
    expect(count).toBe(1);
    expect(remainingTtl).toBeGreaterThan(0);
    expect(remainingTtl).toBeLessThanOrEqual(60);

    await redis.del(ttlKey);
  });

  test("does not reset TTL when an existing counter increments", async () => {
    const ttlKey = `${testKey}:ttl-stable`;

    const windows = [{ redisKey: ttlKey, limit: 5, ttl: 60 }];

    await checkAndIncrement(windows);

    // Give the initial TTL a moment to decrease.
    await new Promise((resolve) => setTimeout(resolve, 1100));

    const ttlBefore = await redis.ttl(ttlKey);

    await checkAndIncrement(windows);

    const ttlAfter = await redis.ttl(ttlKey);

    expect(Number(await redis.get(ttlKey))).toBe(2);
    expect(ttlAfter).toBeLessThanOrEqual(ttlBefore);
    expect(ttlAfter).toBeGreaterThan(0);

    await redis.del(ttlKey);
  });

  afterAll(async () => {
    await redis.del(testKey);
    await redis.quit();
  });

  test("allows requests until the limit is reached", async () => {
    const windows = [{ redisKey: testKey, limit: 2, ttl: 60 }];

    expect(await checkAndIncrement(windows)).toBe(1);
    expect(await checkAndIncrement(windows)).toBe(1);
    expect(await checkAndIncrement(windows)).toBe(0);

    expect(Number(await redis.get(testKey))).toBe(2);
  });
});
