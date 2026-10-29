const client = require("../config/redis");
const ServiceUnavailableError = require("../utils/ServiceUnavailableError");
const FIXED_WINDOW_SCRIPT = `
  local windowCount = #KEYS

-- Pass 1: Check every window before modifying anything.
for i = 1, windowCount do
   local count = tonumber(redis.call('GET', KEYS[i])) or 0
    local limit = tonumber(ARGV[(i - 1) * 2 + 1])
    local ttl = tonumber(ARGV[(i - 1) * 2 + 2])

    if not limit or limit <= 0 then
        return redis.error_reply('Invalid rate limit')
    end

    if not ttl or ttl <= 0 then
        return redis.error_reply('Invalid TTL')
    end

    if count >= limit then
        return 0
    end
end

-- Pass 2: All windows allow the request, so update them.
for i = 1, windowCount do
    local ttl = tonumber(ARGV[(i - 1) * 2 + 2])
    local count = redis.call('INCR', KEYS[i])

    if count == 1 then
        redis.call('EXPIRE', KEYS[i], ttl)
    end
end

return 1
`;
async function consumeFixedWindow(windows) {
  const keys = windows.map((window) => window.redisKey);

  const args = windows.flatMap((window) => [window.limit, window.ttl]);
  const timeout = new Promise((_, reject) => {
    setTimeout(
      () =>
        reject(
          new ServiceUnavailableError("Redis rate-limit operation timed out"),
        ),
      3000,
    );
  });
  const result = client.eval(
    FIXED_WINDOW_SCRIPT,
    keys.length,
    ...keys,
    ...args,
  );
  return Promise.race([result, timeout]);
}
function getSecondsUntilNextMinute(currentTime) {
  const seconds = currentTime.getUTCSeconds();
  return 60 - seconds;
}
function getSecondsUntilNextDay(currentTime) {
  const nextDay = new Date(currentTime);
  nextDay.setUTCHours(24, 0, 0, 0);

  return Math.ceil((nextDay - currentTime) / 1000);
}
async function checkAndIncrement(windows) {
  return consumeFixedWindow(windows);
}

function buildRateLimitKey(apiKeyId, windowType, windowStart) {
  return `ratelimit:api_key:${apiKeyId}:${windowType}:${windowStart}`;
}

module.exports = {
  buildRateLimitKey,
  getSecondsUntilNextMinute,
  checkAndIncrement,
  getSecondsUntilNextDay,
};
