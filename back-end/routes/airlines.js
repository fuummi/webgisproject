const express = require("express");
const router = express.Router();
// 航班相关controller
const {
  list,
  findByFAirport,
  findByTAirport,
  findByTime,
  findByMap,
} = require("../controller/airlines");


// 获取全部航班列表
router.get("/", list);
// 根据启航机场获取列表
router.post("/findbyfairport", findByFAirport);
// 根据抵达机场获取列表
router.post("/findbytairport", findByTAirport);
// 根据时间获取航班列表
router.get("/findbytime", findByTime);
// 根据从/到某个城市/机场的条件获取航班列表
router.get("/findbymap", findByMap);

module.exports = router;
