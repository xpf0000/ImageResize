<template>
  <div class="task-wapper">
    <div class="nav">
      <div class="left" @click="doClose">
        <yb-icon :svg="import('../../svg/back.svg?raw')" width="24" height="24" />
        <span class="ml-15">返回</span>
      </div>
      <div class="right">
        <el-button v-loading="running" @click="doTran">开始转换</el-button>
      </div>
    </div>
    <div class="setting-wapper">
      <el-form ref="form" label-position="top" label-width="100px" :model="form" :rules="rules">
        <el-row class="flex-shrink-0" :gutter="100">
          <el-col :span="12">
            <el-form-item label="宽度" prop="width">
              <el-input
                v-model.number="form.width"
                placeholder="宽高只设置一个, 另一个会自适应改变, 图片不会变形"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="高度" prop="height">
              <el-input
                v-model.number="form.height"
                placeholder="宽高只设置一个, 另一个会自适应改变, 图片不会变形"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item class="flex-shrink-0" label="保存位置" prop="path">
          <el-input v-model="form.path">
            <template #append>
              <el-button class="folder-btn" @click="choosePath">
                <yb-icon :svg="import('../../svg/folder.svg?raw')"></yb-icon>
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item class="flex-shrink-0" label="转换进度">
          <el-progress
            style="width: 100%"
            :text-inside="true"
            :stroke-width="26"
            :percentage="percentage"
          >
            <span>{{ runed }} / {{ count }}</span>
          </el-progress>
        </el-form-item>
        <el-form-item class="flex-1" label="转换文件">
          <el-table :data="files" height="100%" style="width: 100%">
            <el-table-column prop="path" label="文件"></el-table-column>
            <el-table-column prop="run" label="状态" width="180">
              <template #default="scope">
                <span
                  class="task-status"
                  :class="{ success: scope.row.run === 1, fail: scope.row.run === 2 }"
                  >{{ status[scope.row.run] }}</span
                >
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import IPC from '../../util/IPC.js'
  import { EventBus } from '../../global.js'

  const _FS = require('fs')
  const { dialog } = require('@electron/remote')

  export default {
    data() {
      return {
        running: false,
        status: {
          0: '未开始',
          1: '已完成',
          2: '失败'
        },
        form: {
          width: null,
          height: null,
          path: ''
        },
        rules: {
          width: [
            {
              validator: this.validateWH,
              trigger: 'blur'
            }
          ],
          height: [{ validator: this.validateWH, trigger: 'blur' }],
          path: [{ validator: this.validatePath, trigger: 'blur' }]
        }
      }
    },
    computed: {
      ...mapGetters('app', {
        files: 'files'
      }),
      count() {
        return this.files.length
      },
      runed() {
        return this.files.filter((f) => {
          return f.run
        }).length
      },
      percentage() {
        return (this.runed / this.count) * 100.0
      }
    },
    watch: {
      form: {
        handler() {
          this.files.forEach((f) => {
            f.run = 0
          })
        },
        deep: true
      }
    },
    mounted() {
      EventBus.on('IPC-Key-Task:task-result', this.taskResult)
      EventBus.on('IPC-Key-Task:task-end', this.taskEnd)
    },
    unmounted() {
      EventBus.off('IPC-Key-Task:task-result', this.taskResult)
      EventBus.off('IPC-Key-Task:task-end', this.taskEnd)
    },
    methods: {
      doClose() {
        if (this.running) {
          this.$confirm(
            '任务正在执行中, 重新设定任务会导致当前任务无法完成, 是否退出当前任务?',
            '提示',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          ).then(() => {
            this.$store.commit('app/SET_FILES', [])
            this.$store.commit('app/SET_TASK_SHOW', false)
          })
        } else {
          this.$store.commit('app/SET_FILES', [])
          this.$store.commit('app/SET_TASK_SHOW', false)
        }
      },
      taskResult(info) {
        console.log('taskResult: ', info)
        this.files.some((f) => {
          if (f.path === info.src) {
            f.run = info.result ? 1 : 2
            return true
          }
          return false
        })
      },
      taskEnd() {
        console.log('taskEnd !!!!!!')
        this.running = false
        this.$message.success('转换完成')
      },
      choosePath() {
        let opt = ['openDirectory', 'createDirectory']
        dialog
          .showOpenDialog({
            properties: opt
          })
          .then(({ canceled, filePaths }) => {
            if (canceled || filePaths.length === 0) {
              return
            }
            this.form.path = filePaths[0]
          })
      },
      validatePath(rule, value, callback) {
        if (
          !this.form.path ||
          !_FS.existsSync(this.form.path) ||
          !_FS.statSync(this.form.path).isDirectory()
        ) {
          callback(new Error('保存路径不正确'))
          return
        }
        callback()
      },
      validateWH(rule, value, callback) {
        if (this.form.width > 0 || this.form.height > 0) {
          callback()
        } else {
          callback(new Error('宽高必须输入其中一项'))
        }
      },
      doTran() {
        this.$refs.form.validate(async (valid, fields) => {
          if (valid) {
            console.log('submit!')
            const arrs = this.files.map((f) => {
              return {
                width: this.form.width,
                height: this.form.height,
                src: f.path,
                dsc: this.form.path
              }
            })
            console.log('arrs: ', arrs)
            this.running = true
            IPC.send('App:Task-Run', arrs).then((res) => {
              console.log('res: ', res)
            })
          } else {
            console.log('error submit!', fields)
          }
        })
      }
    }
  }
</script>

<style lang="scss">
  .task-wapper {
    height: 100%;
    width: 100%;
    overflow: hidden;
    padding: 0 12px 12px 12px;
    color: #fff;
    display: flex;
    flex-direction: column;

    &::-webkit-scrollbar {
      width: 0;
      height: 0;
      display: none;
    }

    .nav {
      height: 80px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      /*background: #454764;*/
      color: #fff;
      .left {
        cursor: pointer;
        display: flex;
        align-items: center;
        padding: 6px 0;
      }
    }

    .setting-wapper {
      flex: 1;
      overflow: hidden;
      padding: 20px 20px 0 20px;

      .flex-shrink-0 {
        flex-shrink: 0;
      }

      .flex-1 {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;

        .el-form-item__label {
          flex-shrink: 0;
        }
        .el-form-item__content {
          flex: 1;
          overflow: hidden;
        }
      }

      .el-form {
        height: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .el-form-item__label {
        color: #fff;
      }

      .folder-btn {
        padding-left: 30px;
        padding-right: 30px;

        svg {
          width: 20px;
          height: 20px;
          color: #fdab1f;
        }
      }
    }

    .task-status {
      &.success {
        color: #27a961;
      }

      &.fail {
        color: #ff7042;
      }
    }
  }
</style>
