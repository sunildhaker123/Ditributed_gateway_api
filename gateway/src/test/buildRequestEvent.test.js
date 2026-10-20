const requestMetrics = require("../middleware/requestMetrics.middleware");
const buildRequestEvent = require("../utils/buildRequestEvent");

jest.mock("../utils/buildRequestEvent", () => jest.fn());

describe("requestMetrics middleware", () => {
  test("builds an analytics event when the response finishes", () => {
    const req = {
      method: "GET",
      path: "/protected",
      apiKey: { id: 7 },
    };

    const res = {
      statusCode: 200,
      on: jest.fn(),
    };

    const next = jest.fn();

    buildRequestEvent.mockReturnValue({
      apiKeyId: 7,
      statusCode: 200,
    });

    requestMetrics(req, res, next);

    // The middleware should continue the request pipeline.
    expect(next).toHaveBeenCalledTimes(1);

    // Capture the callback registered for the response's finish event.
    const finishCallback = res.on.mock.calls[0][1];

    expect(res.on).toHaveBeenCalledWith("finish", expect.any(Function));

    // Simulate the response finishing.
    finishCallback();

    // Verify that the event builder received the expected arguments.
    expect(buildRequestEvent).toHaveBeenCalledWith(
      req,
      res,
      expect.any(Number),
      expect.any(Number),
    );
  });
});
