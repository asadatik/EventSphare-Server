
const express = require("express");
const router = express.Router();
const {getPieChartData, getAreaChartData, getBarChartData, getWeeklySales } = require("../../controller/stats/organizerStats");


router.get("/organizer-stats/:email", getAreaChartData);
router.get("/organizer-pieChart/:email", getPieChartData);
router.get("/organizer-barChart/:email", getBarChartData);
router.get("/organizer-WeeklySales/:email", getWeeklySales);





module.exports = router;