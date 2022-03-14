<template>
  <div id="FileInfoDroper" class="main-wapper">
    <div class="select-dir-wapper">
      <div id="selectDir" :class="{ ondrop: ondrop }" @click.stop="choosePath">
        <yb-icon :svg="import('../../svg/upload.svg?raw')" class="icon" />
        <span>将文件/文件夹拖到此处,或点击选择文件</span>
      </div>
    </div>
  </div>
</template>

<script>
  import { getAllFileAsync } from '../../../shared/file.js'
  const { dialog } = require('@electron/remote')
  const path = require('path')

  const FileExt = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif']

  export default {
    data() {
      return {
        ondrop: false
      }
    },
    computed: {},
    mounted() {
      let selecter = document.getElementById('FileInfoDroper')
      selecter.addEventListener('drop', (e) => {
        e.preventDefault()
        e.stopPropagation()
        // 获得拖拽的文件集合
        let files = e.dataTransfer.files
        console.log('files: ', files)
        this.onGetPath(
          [...files].map((file) => {
            return file.path
          })
        )
      })
      selecter.addEventListener('dragover', (e) => {
        e.preventDefault()
        e.stopPropagation()
      })

      selecter.addEventListener(
        'dragenter',
        (e) => {
          this.dropNode = e.target
          this.ondrop = true
        },
        false
      )
      selecter.addEventListener(
        'dragleave',
        (e) => {
          if (e.target === this.dropNode) {
            this.ondrop = false
          }
        },
        false
      )
    },
    methods: {
      onGetPath(paths) {
        console.log('onGetPath: ', paths)
        const arr = []
        const queue = []
        paths.forEach((p) => {
          queue.push(getAllFileAsync(p))
        })
        Promise.all(queue).then((parr) => {
          parr.forEach((plist) => {
            plist = plist.filter((p) => {
              const ext = path.extname(p)
              return FileExt.includes(ext)
            })
            const set = new Set(plist)
            plist = [...set]
            plist = plist.map((p) => {
              return { path: p, run: 0 }
            })
            arr.push(...plist)
            this.$store.commit('app/SET_FILES', arr)
            this.$store.commit('app/SET_TASK_SHOW', true)
          })

          console.log('arr: ', arr)
        })
      },
      choosePath() {
        let opt = ['openFile', 'openDirectory', 'multiSelections']
        dialog
          .showOpenDialog({
            properties: opt
          })
          .then(({ canceled, filePaths }) => {
            if (canceled || filePaths.length === 0) {
              return
            }
            console.log('filePaths: ', filePaths)
            this.onGetPath(filePaths)
          })
      }
    }
  }
</script>

<style lang="scss" scoped>
  .main-wapper {
    flex: 1;
    height: 100%;
    width: 100%;
    overflow: auto;
    padding: 12px;
    color: rgba(255, 255, 255, 0.7);
    &::-webkit-scrollbar {
      width: 0;
      height: 0;
      display: none;
    }
    .select-dir-wapper {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      #selectDir {
        width: 70%;
        height: 70%;
        border: 2px dashed #ccc;
        border-radius: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        cursor: pointer;
        color: #fff;
        .icon {
          width: 100px;
          height: 100px;
          margin-bottom: 20px;
        }

        &.ondrop {
          border: 2px dashed #fdab1f;

          .icon {
            color: #fdab1f;
          }
        }
      }
    }
    .info-wapper {
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
      padding: 40px 12px;
      font-size: 17px;
      > li {
        padding-bottom: 30px;
        display: flex;
        user-select: text;
        > span {
          margin-right: 40px;
          &:first-child {
            text-align: right;
            width: 110px;
          }
        }
      }
    }
  }
</style>
