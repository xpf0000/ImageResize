<template>
  <TitleBar />
  <div class="main">
    <ResiTask v-if="taskShow"></ResiTask>
    <FileDroper v-else></FileDroper>
  </div>
</template>

<script>
  import TitleBar from './components/Native/TitleBar.vue'
  import FileDroper from './components/FileDroper/index.vue'
  import ResiTask from './components/ResizeTask/index.vue'
  import { mapGetters } from 'vuex'
  import { EventBus } from './global.js'

  export default {
    name: 'App',
    components: { TitleBar, FileDroper, ResiTask },
    data() {
      return {}
    },
    computed: {
      ...mapGetters('app', {
        taskShow: 'taskShow'
      })
    },
    watch: {},
    created() {
      EventBus.on('application:about', this.showAboug)
    },
    unmounted() {
      EventBus.off('application:about', this.showAboug)
    },
    mounted() {},
    methods: {
      showAboug() {
        this.$baseDialog(import('./components/About/index.vue'))
          .className('about-dialog')
          .title('关于我们')
          .noFooter()
          .then()
          .show()
      }
    }
  }
</script>

<style lang="scss">
  html,
  body,
  #app {
    min-height: 100vh;
    min-width: 100vw;
    overflow: hidden;
  }
  .main {
    height: calc(100vh - 44px) !important;
    overflow: auto;

    &::-webkit-scrollbar {
      display: none;
    }
  }
  #app {
    padding: 44px 0 0 0;
  }
</style>
