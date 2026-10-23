const express = require("express");
const analyticsRouter = express.Router();
const {
  analyticsSummaryController,
} = require("../controllers/analytics.controller");
analyticsRouter.get("/", analyticsSummaryController);

module.exports = { analyticsRouter };
