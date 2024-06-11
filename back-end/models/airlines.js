const { query } = require("express");
const { Airlines, Airports } = require("../utils/db");

// 从数据库获取全部航班列表
exports.findList = () => {
  return Airlines.find().sort({ _id: -1 });
};

// 从数据库根据启航机场获取全部航班列表
exports.findByFromAirport = key => {
  return new Promise((resolve, reject) => {
    const regex = new RegExp(key);
    Airports.find({ "cn-name": { $regex: regex } }, (err, departureAirports) => {
      if (err) {
        console.error("Error finding departure airports:", err);
        return reject(err);
      }

      const promises = [];
      let index = 0;

      function processDepartureAirport() {
        if (index < departureAirports.length) {
          const departureAirport = departureAirports[index];
          if (!departureAirport) {
            console.error("Departure airport not found");
            rejectAirline();
          }

          const departureAirportObj = departureAirport.toObject();
          Airlines.find({ DepartureAirport: departureAirportObj.iata_code }, (err, airlines) => {
            if (err) {
              console.error("Error finding airlines:", err);
              return rejectAirline(err);
            }

            airlines.forEach(airline => {
              const airLineObj = airline.toObject();
              const arrivalAirportCode = airLineObj.ArrivalAirport;
              Airports.find({ iata_code: arrivalAirportCode }, (err, arrivalAirports) => {
                if (err) {
                  console.error("Error finding arrival airports:", err);
                  return rejectAirline(err);
                }

                arrivalAirports.forEach(arrivalAirport => {
                  promises.push(new Promise((resolveAirline, rejectAirline) => {
                    if (!arrivalAirport) {
                      console.error("Arrival airport not found");
                      return rejectAirline();
                    }

                    const arrivalAirportObj = arrivalAirport.toObject();
                    // 构造所需格式的数据
                    const formattedAirline = {
                      _id: airLineObj._id,
                      DepartureTime: airLineObj.DepartureTime,
                      ArrivalTime: airLineObj.ArrivalTime,
                      FlightDuration: airLineObj.FlightDuration,
                      FlightNumber: airLineObj.FlightNumber,
                      DepartureAirport: {
                        iata_code: departureAirportObj.iata_code,
                        latitude_deg: departureAirportObj.latitude_deg,
                        longitude_deg: departureAirportObj.longitude_deg,
                        type: departureAirportObj.type,
                        "cn-name": departureAirportObj["cn-name"],
                        name: departureAirportObj.name,
                        elevation_ft: departureAirportObj.elevation_ft,
                      },
                      ArrivalAirport: {
                        iata_code: arrivalAirportObj.iata_code,
                        latitude_deg: arrivalAirportObj.latitude_deg,
                        longitude_deg: arrivalAirportObj.longitude_deg,
                        type: arrivalAirportObj.type,
                        "cn-name": arrivalAirportObj["cn-name"],
                        name: arrivalAirportObj.name,
                        elevation_ft: arrivalAirportObj.elevation_ft,
                      },
                      Airline: airLineObj.Airline
                    };
                    resolveAirline(formattedAirline);
                  }));
                });
              });
            });

            index++;
            processDepartureAirport(); // 递归调用下一个 departureAirport
          });
        } else {
          Promise.all(promises).then(formattedAirlines => {
            resolve({
              data: formattedAirlines.filter(airline => airline !== null), // 过滤掉 null 值
            });
          }).catch(err => {
            console.error("Promise.all error:", err);
            reject(err);
          });
        }
      }

      processDepartureAirport(); // 开始递归处理 departureAirports
    });
  });
};

// 从数据库根据抵达机场获取全部航班列表
exports.findByToAirport = key => {
  return new Promise((resolve, reject) => {
    const regex = new RegExp(key);
    Airports.find({ "cn-name": { $regex: regex } }, (err, arrivalAirports) => {
      if (err) {
        console.error("Error finding departure airports:", err);
        return reject(err);
      }

      const promises = [];
      let index = 0;

      function processArrivalAirport() {
        if (index < arrivalAirports.length) {
          const arrivalAirport = arrivalAirports[index];
          if (!arrivalAirport) {
            console.error("Departure airport not found");
            rejectAirline();
          }

          const arrivalAirportObj = arrivalAirport.toObject();
          Airlines.find({ ArrivalAirport: arrivalAirportObj.iata_code }, (err, airlines) => {
            if (err) {
              console.error("Error finding airlines:", err);
              return rejectAirline(err);
            }

            airlines.forEach(airline => {
              const airLineObj = airline.toObject();
              const departureAirportCode = airLineObj.DepartureAirport;
              Airports.find({ iata_code: departureAirportCode }, (err, departureAirports) => {
                if (err) {
                  console.error("Error finding arrival airports:", err);
                  return rejectAirline(err);
                }

                departureAirports.forEach(departureAirport => {
                  promises.push(new Promise((resolveAirline, rejectAirline) => {
                    if (!departureAirport) {
                      console.error("Arrival airport not found");
                      return rejectAirline();
                    }

                    const departureAirportObj = departureAirport.toObject();
                    // 构造所需格式的数据
                    const formattedAirline = {
                      _id: airLineObj._id,
                      DepartureTime: airLineObj.DepartureTime,
                      ArrivalTime: airLineObj.ArrivalTime,
                      FlightDuration: airLineObj.FlightDuration,
                      FlightNumber: airLineObj.FlightNumber,
                      DepartureAirport: {
                        iata_code: departureAirportObj.iata_code,
                        latitude_deg: departureAirportObj.latitude_deg,
                        longitude_deg: departureAirportObj.longitude_deg,
                        type: departureAirportObj.type,
                        "cn-name": departureAirportObj["cn-name"],
                        name: departureAirportObj.name,
                        elevation_ft: departureAirportObj.elevation_ft,
                      },
                      ArrivalAirport: {
                        iata_code: arrivalAirportObj.iata_code,
                        latitude_deg: arrivalAirportObj.latitude_deg,
                        longitude_deg: arrivalAirportObj.longitude_deg,
                        type: arrivalAirportObj.type,
                        "cn-name": arrivalAirportObj["cn-name"],
                        name: arrivalAirportObj.name,
                        elevation_ft: arrivalAirportObj.elevation_ft,
                      },
                      Airline: airLineObj.Airline
                    };
                    resolveAirline(formattedAirline);
                  }));
                });
              });
            });

            index++;
            processArrivalAirport(); // 递归调用下一个 departureAirport
          });
        } else {
          Promise.all(promises).then(formattedAirlines => {
            resolve({
              data: formattedAirlines.filter(airline => airline !== null), // 过滤掉 null 值
            });
          }).catch(err => {
            console.error("Promise.all error:", err);
            reject(err);
          });
        }
      }

      processArrivalAirport(); // 开始递归处理 departureAirports
    });
  });
};

// 从数据库获取时间点上正在飞行的飞机
exports.findByTime = (date, time, queryPage) => {
  return new Promise((resolve, reject) => {
    // 首先获取所有航空公司数据的总数
    Airlines.countDocuments({}, (err, total) => {
      if (err) {
        return reject(err);
      }

      // 然后分页获取当前页的数据
      Airlines.find({}, (err, airlines) => {
        if (err) {
          return reject(err);
        }

        const promises = airlines.map(airline => {
          return new Promise((resolveAirline, rejectAirline) => {
            const airLineObj = airline.toObject();

            // 获取出发机场信息
            Airports.findOne({ iata_code: airLineObj['DepartureAirport'] }, (err, departureAirport) => {
              if (err || !departureAirport) {
                return rejectAirline({});
              }

              // 获取到达机场信息
              Airports.findOne({ iata_code: airLineObj['ArrivalAirport'] }, (err, arrivalAirport) => {
                if (err || !arrivalAirport) {
                  return rejectAirline({});
                }

                const departureAirportObj = departureAirport.toObject();
                const arrivalAirportObj = arrivalAirport.toObject();

                // 构造所需格式的数据
                const formattedAirline = {
                  _id: airLineObj._id,
                  DepartureTime: airLineObj.DepartureTime,
                  ArrivalTime: airLineObj.ArrivalTime,
                  FlightDuration: airLineObj.FlightDuration,
                  FlightNumber: airLineObj.FlightNumber,
                  DepartureAirport: {
                    iata_code: departureAirportObj.iata_code,
                    latitude_deg: departureAirportObj.latitude_deg,
                    longitude_deg: departureAirportObj.longitude_deg,
                    type: departureAirportObj.type,
                    "cn-name": departureAirportObj["cn-name"],
                    name: departureAirportObj.name,
                    elevation_ft: departureAirportObj.elevation_ft,
                  },
                  ArrivalAirport: {
                    iata_code: arrivalAirportObj.iata_code,
                    latitude_deg: arrivalAirportObj.latitude_deg,
                    longitude_deg: arrivalAirportObj.longitude_deg,
                    type: arrivalAirportObj.type,
                    "cn-name": arrivalAirportObj["cn-name"],
                    name: arrivalAirportObj.name,
                    elevation_ft: arrivalAirportObj.elevation_ft,
                  },
                  Airline: airLineObj.Airline
                };
                resolveAirline(formattedAirline);
              });
            });
          }).catch(() => {
            return null;
          });
        });

        // 等待所有 Promise 完成
        Promise.all(promises).then(formattedAirlines => {
          resolve({
            data: formattedAirlines.filter(airline => airline !== null), // 过滤掉 null 值
            total: total
          });
        }).catch(err => {
          reject(err);
        });
      })
        .skip((parseInt(queryPage) - 1) * 100)
        .limit(100);
    });
  });
};