const airportsModel = require("../models/airports");

// 处理获取机场列表请求
exports.getHot = async (req, res, next) => {
  res.set("content-type", "application/json;charset=utf-8");
  const { name } = req.query;
  const result = await airportsModel.findHot(name);
  if (result) {
    // 热门列表获取成功
    res.render("success", {
      data: JSON.stringify(result),
      msg: "成功获取热门机场列表"
    });
  } else {
    // 热门列表获取失败
    res.render("error", {
      data: "null",
      msg: "获取热门机场列表失败"
    });
  }
};
