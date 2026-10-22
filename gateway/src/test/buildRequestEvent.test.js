const requestMetrics = require("../middleware/requestMetrics.middleware");
const buildRequestEvent = require("../utils/buildRequestEvent");
const analyticsQueue = require("../config/analyticsQueue");

jest.mock("../utils/buildRequestEvent", () => jest.fn());

jest.mock("../config/analyticsQueue", () => ({
  add: jest.fn().mockResolvedValue({ id: "test-job" }),
}));

describe("requestMetrics validation", () => {
  test("does not enqueue an event with an invalid status code", async () => {
    // Arrange: make the event invalid
    buildRequestEvent.mockReturnValue({
      apiKeyId: 2,
      timestamp: new Date().toISOString(),
      method: "GET",
      path: "/",
      statusCode: 99,
      latencyMs: 10,
    });

    const req = { method: "GET", path: "/" };

    // Capture the finish callback registered by the middleware
    let finishCallback;
    const res = {
      statusCode: 200,
      on: jest.fn((eventName, callback) => {
        if (eventName === "finish") {
          finishCallback = callback;
        }
      }),
    };

    const next = jest.fn();

    // Act: register the middleware callback
    requestMetrics(req, res, next);

    // Simulate Express finishing the response
    await finishCallback();

    // Assert
    expect(next).toHaveBeenCalledTimes(1);
    expect(analyticsQueue.add).not.toHaveBeenCalled();
  });

  test("enqueues a valid event when apiKeyId is null", async () => {
    jest.clearAllMocks();

    const event = {
      apiKeyId: null,
      timestamp: new Date().toISOString(),
      method: "GET",
      path: "/",
      statusCode: 401,
      latencyMs: 5,
    };

    buildRequestEvent.mockReturnValue(event);

    let finishCallback;

    const req = { method: "GET", path: "/" };

    const res = {
      statusCode: 401,
      on: jest.fn((eventName, callback) => {
        if (eventName === "finish") {
          finishCallback = callback;
        }
      }),
    };

    const next = jest.fn();

    requestMetrics(req, res, next);

    await finishCallback();

    expect(next).toHaveBeenCalledTimes(1);

    expect(analyticsQueue.add).toHaveBeenCalledWith("request-event", event, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
    });
  });
});
