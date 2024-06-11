export default {
  // cesium的token
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5Mzg5YWQyMS01YzcyLTQyZWQtYjE3ZS04Y2M1MmZhYjI2YjEiLCJpZCI6MjE4OTgsImlhdCI6MTYxNTM4MzAzMH0.8z2wKFdv9Aps1RAfB27oITkje23mIW3mnuvAdrK23io",
  // 根据起点终点生成曲线
  _generateCurve(startPoint, endPoint) {
    let addPointCartesian = new Cesium.Cartesian3();
    Cesium.Cartesian3.add(startPoint, endPoint, addPointCartesian);
    let midPointCartesian = new Cesium.Cartesian3();
    Cesium.Cartesian3.divideByScalar(addPointCartesian, 2, midPointCartesian);
    let midPointCartographic = Cesium.Cartographic.fromCartesian(midPointCartesian);
    midPointCartographic.height = Cesium.Cartesian3.distance(startPoint, endPoint) / 10;
    let midPoint = new Cesium.Cartesian3();
    Cesium.Ellipsoid.WGS84.cartographicToCartesian(midPointCartographic, midPoint);
    let spline = new Cesium.CatmullRomSpline({
      times: [0.0, 0.5, 1.0],
      points: [startPoint, midPoint, endPoint]
    });
    let curvePointsArr = [];
    for (let i = 0, len = 300; i < len; i++) {
      curvePointsArr.push(spline.evaluate(i / len));
    }
    return curvePointsArr;
  },

  // 绘制
  generateMigrationMap(viewer, data, data_geo = [], byFrom = 0) {
    // if (viewer.data.queryId != "") viewer.data.queryId = ""; 
    viewer.entities.removeAll();
    if (!data) {
      return;
    }
    let positionArr = [];
    for (let geoLine of data) {
      if (!geoLine) {
        continue
      }
      let startName = geoLine?.DepartureAirport['cn-name'];
      let destinationName = geoLine?.ArrivalAirport['cn-name'];
      let airlineNumb = ''
      let id = geoLine._id;
      // 存储点坐标数据，用于显示热力图
      if (byFrom == 2) {
        // 根据“到”获取，展示出发地热地图
        positionArr.push({
          name: startName,
          x: data_geo[startName][0],
          y: data_geo[startName][1]
        });
      } else if (byFrom == 1) {
        // 根据“从”获取，展示抵达地热地图
        positionArr.push({
          name: destinationName,
          x: data_geo[destinationName][0],
          y: data_geo[destinationName][1]
        });
      }
      // 用于拟合当前曲线的笛卡尔坐标点数组
      let startPt = Cesium.Cartesian3.fromDegrees(data_geo[startName][0], data_geo[startName][1], 0);
      let endPt = Cesium.Cartesian3.fromDegrees(data_geo[destinationName][0], data_geo[destinationName][1], 0);
      let curLinePointsArr = this._generateCurve(startPt, endPt);
      viewer.entities.add({
        // 背景线
        id,
        description: "background-line",
        name: startName + " -> " + destinationName + " " + airlineNumb + "人",
        polyline: {
          width: 1,
          positions: curLinePointsArr,
          material: new Cesium.PolylineDashMaterialProperty({
            color: new Cesium.Color(255 / 255, 249 / 255, 0, 0.2)
          })
        }
      });

      viewer.entities.add({
        // 尾迹线
        description: "trail-line",
        // name: startName + " -> " + destinationName + " " + airlineNumb + "人",
        polyline: {
          width: 3,
          positions: curLinePointsArr,
          material: new Cesium.PolylineTrailLinkMaterialProperty(new Cesium.Color.fromBytes(255, 165, 0, 50), 3000)
        }
      });

      viewer.entities.add({
        // 起点
        description: "start-point",
        name: startName,
        position: Cesium.Cartesian3.fromDegrees(data_geo[startName][0], data_geo[startName][1]),
        billboard: {
          image: require("../assets/images/from_airport_logo.png"),
          width: 20,
          height: 20
        }
      });

      // viewer.entities.add({
      //  终点
      // 	description: "end-point",
      // 	name: destinationName,
      // 	position: Cesium.Cartesian3.fromDegrees(data_geo[destinationName][0], data_geo[destinationName][1]),
      // 	point: {
      // 		color: new Cesium.Color(251 / 255, 7 / 255, 0, 0.7),
      // 		pixelSize: 10
      // 	}
      // });
      viewer.entities.add({
        description: "end-point",
        name: destinationName,
        position: Cesium.Cartesian3.fromDegrees(data_geo[destinationName][0], data_geo[destinationName][1]),
        billboard: {
          image: require("../assets/images/to_airport_logo.png"),
          width: 20,
          height: 20
        }
      });
    }
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction((movement) => {
      const pickedObject = viewer.scene.pick(movement.position);
      if (Cesium.defined(pickedObject)) {
        const entity = pickedObject.id;
        viewer.entities.removeById('tooltip');
        console.log(entity);
        // 获取实体的位置信息
        const position = entity._position.getValue(Cesium.JulianDate.now());
        const lonLat = Cesium.Cartographic.fromCartesian(position);
        const longitude = Cesium.Math.toDegrees(lonLat.longitude).toFixed(6);
        const latitude = Cesium.Math.toDegrees(lonLat.latitude).toFixed(6);
        const elevation = lonLat.height.toFixed(2);
        fetch(`http://localhost:3000/api/airmana/airports/hot?name=${entity._name}`).then((res) => res.json()).then(({ data }) => {
          // 创建提示框
          const tooltip = viewer.entities.add({
            id: 'tooltip',
            position: Cesium.Cartesian3.fromDegrees(data_geo[entity._name][0], data_geo[entity._name][1] + 0.001), // 调整位置在点的上方
            label: {
              text: `${data['cn-name']}\n机场代码: ${data.iata_code}\n纬度: ${data.latitude_deg}\n经度: ${data.longitude_deg}\n海拔: ${data.elevation_ft} ft`,
              font: '14pt monospace',
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              fillColor: Cesium.Color.BLACK, // 设置文字颜色为黑色
              outlineWidth: 2,
              backgroundColor: Cesium.Color.WHITE.withAlpha(0.8), // 设置背景颜色为白色，并添加透明度
              showBackground: true, // 显示背景
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -20) // 提示框位置调整
            }
          });
        })



      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    return positionArr;
  },

  // 改变样式
  changeStyle(viewer, oldId, id) {
    let res = id;
    if (oldId !== "") {
      // 恢复样式
      let oldEntity = viewer.entities.getById(oldId);
      oldEntity.polyline.width = 1;
      oldEntity.polyline.material = new Cesium.PolylineDashMaterialProperty({
        color: new Cesium.Color(255 / 255, 249 / 255, 0, 0.2)
      });
    }
    if (oldId === id) {
      // 恢复样式
      let oldEntity = viewer.entities.getById(id);
      oldEntity.polyline.width = 1;
      oldEntity.polyline.material = new Cesium.PolylineDashMaterialProperty({
        color: new Cesium.Color(255 / 255, 249 / 255, 0, 0.2)
      });
      res = "";
    } else {
      // 高亮显示
      let entity = viewer.entities.getById(id);
      entity.polyline.width = 5;
      entity.polyline.material = new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.5,
        color: Cesium.Color.BLUE
      });
    }
    return res;
  }
};
