<template>
  <div id="js-mask" class="mask"></div>
  <canvas id="js-canvas" class="image-canvas"></canvas>
  <div id="js-size-info" class="size-info"></div>
  <div id="js-toolbar" class="toolbar">
    <yb-icon id="js-tool-reset" :svg="import('../svg/redo.svg?raw')"></yb-icon>
    <yb-icon id="js-tool-close" :svg="import('../svg/close.svg?raw')"></yb-icon>
    <yb-icon id="js-tool-ok" :svg="import('../svg/select.svg?raw')"></yb-icon>
  </div>
</template>

<script>
  import { getScreenCapture } from './utils.js'

  export default {
    name: 'App',
    components: {},
    data() {
      return {}
    },
    created() {
      // 右键取消截屏
      document.body.addEventListener(
        'mousedown',
        (e) => {
          if (e.button === 2) {
            window.close()
          }
        },
        true
      )
    },
    mounted() {
      getScreenCapture()
    },
    methods: {}
  }
</script>

<style lang="scss">
  html,
  body {
    min-height: 100vh;
    min-width: 100vw;
  }
  html,
  body,
  div {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
  }

  .bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .image-canvas {
    position: absolute;
    display: none;
    z-index: 1;
  }

  .size-info {
    position: absolute;
    color: #ffffff;
    font-size: 12px;
    background: rgba(40, 40, 40, 0.8);
    padding: 5px 10px;
    border-radius: 2px;
    font-family: Arial Consolas sans-serif;
    display: none;
    z-index: 2;
  }

  .toolbar {
    position: absolute;
    color: #343434;
    font-size: 12px;
    background: #f5f5f5;
    padding: 5px 5px;
    border-radius: 4px;
    font-family: Arial Consolas sans-serif;
    display: none;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
    z-index: 2;
    align-items: center;

    > svg {
      width: 18px;
      height: 18px;
      margin: 3px 7px;
      cursor: pointer;
    }
  }

  .toolbar .iconfont {
    font-size: 24px;
    padding: 2px 5px;
  }
</style>
