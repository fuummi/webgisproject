<template>
  <div class="container">
    <el-card shadow="hover" v-for="item in cList" :key="item._id">
      <p class="card-title" @click="cardClick(item._id)">{{ item.FlightNumber }}</p>
      <div style="display: flex">
        <p class="card-place">从</p>
        <p class="small-font">：{{ item.DepartureAirport['cn-name'] }}</p>
      </div>
      <div style="display: flex">
        <p class="card-place">到</p>
        <p class="small-font">：{{ item.ArrivalAirport['cn-name'] }}</p>
      </div>
      <div class="card-time">
        <p class="small-font">{{ item.DepartureTime }}</p>
        <span class="small-font float">{{
          calculateTotalDuration(`${item.DepartureTime} ${item.ArrivalTime}`)
        }}</span>
        <el-progress
          :percentage="100"
          :show-text="false"
          :stroke-width="3"
          :color="customColors"
          style="width: 50%"
        ></el-progress>
        <p class="small-font">{{ item.ArrivalTime }}</p>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'AirlinesList',
  data() {
    return {
      customColors: [
        { color: '#409eff', percentage: 99 },
        { color: '#5cb87a', percentage: 101 },
      ],
    };
  },
  props: {
    cList: {
      type: Array,
      default() {
        return [];
      },
      required: true,
    },
  },
  methods: {
    // 点击卡片，在地图高亮
    cardClick(id) {
      this.$emit('cardclick', id);
    },
    calculateTotalDuration(timeString) {
      // 拆分输入字符串并解析时间
      const [startTime, endTime] = timeString.split(' ');
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);

      // 计算开始时间和结束时间的分钟数
      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;

      // 计算时间间隔
      let totalMinutes = endTotalMinutes - startTotalMinutes;

      // 处理跨天情况（如果结束时间在开始时间之前）
      if (totalMinutes < 0) {
        totalMinutes += 24 * 60;
      }

      // 计算小时和分钟
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      return `${hours}小时${minutes}分`;
    },
  },
  watch: {
    cList(n) {
      this.cList = n;
    },
  },
};
</script>

<style lang="less" scoped>
.container {
  width: 100%;
  height: 100%;
}
.el-card {
  margin-bottom: 5px;
}

.card-title {
  font-size: 1.2em;
  font-weight: 600;
  color: @homeBlue;
  margin-top: 0;
  cursor: pointer;
}

.card-time {
  display: flex;
  justify-content: space-around;

  .el-progress {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .float {
    position: absolute;
  }
}

.card-place {
  background: @homeBlue;
  font-size: 0.5em;
  color: white;
  display: block;
  width: 17px;
  height: 17px;
  text-align: center;
  line-height: 17px;
  border-radius: 3px;
  margin-right: 10px;
}

.small-font {
  font-size: 0.5em;
  color: gray;
}
</style>
