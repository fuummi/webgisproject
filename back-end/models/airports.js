const { Airports } = require("../utils/db");

// 从数据库获取机场
exports.findHot = name => {
  return Airports.findOne({ 'cn-name': name });
};
