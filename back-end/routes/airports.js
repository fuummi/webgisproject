const express = require("express");
const router = express.Router();
const { getHot } = require("../controller/airports");


// 获取热门机场列表
router.get("/hot", getHot);

module.exports = router;
