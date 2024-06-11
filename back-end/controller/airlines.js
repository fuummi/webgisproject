const airlinesModel = require("../models/airlines");
const { arrAddFirst } = require("../utils/tools");

// 处理获取全部航班列表的请求
exports.list = async (req, res, next) => {
  res.set("content-type", "application/json;charset=utf-8");
  const result = await airlinesModel.findList();
  if (result) {
    // 获取全部列表成功
    res.render("success", {
      data: JSON.stringify(result),
      msg: "获取到航班全部列表"
    });
  } else {
    // 获取全部列表失败
    res.render("error", {
      data: "null",
      msg: "获取航班全部列表失败"
    });
  }
};

// 处理获取从xx机场启航的所有航班列表的请求
exports.findByFAirport = async (req, res, next) => {
  res.set("content-type", "application/json;charset=utf-8");
  const { startAirport } = req.body;
  const result = await airlinesModel.findByFromAirport(startAirport);
  let resultList = result.map(item => {
    return item.endAirport;
  });
  const resultSet = new Set(resultList);
  resultList = Array.from(resultSet);
  resultList = resultList.map(item => {
    return { name: item };
  });
  const arr = arrAddFirst(resultList);
  if (arr) {
    res.render("success", {
      data: JSON.stringify(arr),
      msg: `获取从${startAirport}启航的所有机场列表`
    });
  } else {
    res.render("error", {
      data: "null",
      msg: `获取从${startAirport}启航的所有机场列表失败`
    });
  }
};

// 处理获取抵达xx机场的所有航班列表的请求
exports.findByTAirport = async (req, res, next) => {
  res.set("content-type", "application/json;charset=utf-8");
  const { endAirport } = req.body;
  const result = await airlinesModel.findByToAirport(endAirport);
  let resultList = result.map(item => {
    return item.startAirport;
  });
  const resultSet = new Set(resultList);
  resultList = Array.from(resultSet);
  resultList = resultList.map(item => {
    return { name: item };
  });
  const arr = arrAddFirst(resultList);
  if (arr) {
    res.render("success", {
      data: JSON.stringify(arr),
      msg: `获取抵达${endAirport}的所有机场列表`
    });
  } else {
    res.render("error", {
      data: "null",
      msg: `获取抵达${endAirport}的所有机场列表失败`
    });
  }
};

// 处理根据时间获取航班的请求
exports.findByTime = async (req, res, next) => {
  res.set("content-type", "application/json;charset=utf-8");
  const { weekday, time, page } = req.query;
  const result = await airlinesModel.findByTime(weekday, time, page);
  if (result) {
    res.render("success", {
      data: JSON.stringify({ result }),
      msg: "根据时间获取航班成功"
    });
  } else {
    res.render("error", {
      data: "null",
      msg: "根据时间获取航班失败"
    });
  }
};

// 处理根据从/到某个城市/机场的条件获取航班的请求
exports.findByMap = async (req, res, next) => {
  res.set("content-type", "application/json;charset=utf-8");
  const { byFrom, byCity, query } = req.query;
  let result = "";
  if (byFrom == "true") {
    // 从某个机场出发
    result = await airlinesModel.findByFromAirport(query);
  } else {
    // 到某个机场
    result = await airlinesModel.findByToAirport(query);
  }
  if (result !== "") {
    res.render("success", {
      data: JSON.stringify(result),
      msg: "获取列表成功"
    });
  } else {
    res.render("error", {
      data: "null",
      msg: "获取列表失败"
    });
  }
};
