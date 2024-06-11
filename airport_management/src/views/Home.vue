<template>
  <el-container class="home_container">
    <!-- 整体页面头部 -->
    <el-header class="home_header">
      <!-- 头部：图标与名称展示 -->
      <div class="info_box">
        <div>
          <span
            :style="
               {
                marginLeft: '10px'
              }
            "
            >机场航班展示系统</span
          >
        </div>
      </div>
    </el-header>
    <!-- 整体页面主体 -->
    <el-main class="home_main" :style="mapStyle()">
      <!-- 主体：子路由 -->
      <keep-alive>
        <router-view :style="viewStyle()" v-if="!$route.meta.noAlive"></router-view>
      </keep-alive>
      <router-view v-if="$route.meta.noAlive"></router-view>
    </el-main>
  </el-container>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {};
  },
  methods: {
    // 设定地图样式
    mapStyle() {
      if (this.$route.path == '/map') {
        return {
          padding: 0,
        };
      } else {
        return '';
      }
    },
    // 设定路由组件样式
    viewStyle() {
      if (this.$route.path == '/map') {
        return {
          height: '100%',
        };
      } else {
        return '';
      }
    },
  },
};
</script>

<style lang="less" scoped>
.home_container {
  height: 100%;
}
.home_header {
  background-color: @homeWhite;
  display: flex;
  align-items: center;
  padding-left: 0;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.15);

  .info_box {
    width: 320px;
    height: 0;
    border-width: 60px 60px 0 0;
    border-style: solid solid none none;
    border-color: @homeBlue transparent transparent transparent;
    position: relative;

    & > div {
      color: @homeWhite;
      position: absolute;
      top: -55px;
      font-size: 1.4rem;
      font-weight: 600;
      letter-spacing: 0.4rem;
      display: flex;
      align-items: center;

      img {
        height: 50px;
        padding: 0 10px;
      }
    }
  }
}

.el-menu-item {
  margin: 0 20px;
  &:hover {
    color: @homeBlue !important;
    background-color: transparent !important;
  }
}

.avatar {
  cursor: pointer;
  margin-left: auto;
}

.home_main {
  background-color: @homeGray;
  overflow: scroll;
  overflow-x: auto;
  overflow-y: auto;
}
</style>
