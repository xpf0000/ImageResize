const { fork } = require('child_process')
const _PATH = require('path')
const EventBus = require('./EventBus.js')
const sharp = require('sharp')

const TaskStatus = {
  waiting: 'waiting',
  running: 'running'
}
class Task {
  constructor() {
    this.status = TaskStatus.waiting
    // 接收任务管理器通知 可以获取任务执行了
    EventBus.on('Task-Run', () => {
      if (this.status === TaskStatus.waiting) {
        this._then && this._then()
      }
    })
  }

  then(_then) {
    this._then = _then
  }

  run({ width, height, src, dsc }) {
    if (this.status !== TaskStatus.waiting) {
      return
    }
    this.status = TaskStatus.running
    let filename = _PATH.basename(src)
    const ext = _PATH.extname(src)
    filename = filename.replace(ext, `w_${width || 'auto'}_h_${height || 'auto'}${ext}`)
    const dscPath = _PATH.join(dsc, filename)
    sharp(src)
      .resize(width || null, height || null)
      .toFile(dscPath)
      .then(() => {
        process.send({
          command: 'Task:task-result',
          info: {
            src: src,
            dsc: dscPath,
            result: true
          }
        })
        this.status = TaskStatus.waiting
        this._then && this._then()
      })
      .catch(() => {
        process.send({
          command: 'Task:task-result',
          info: {
            src: src,
            dsc: dscPath,
            result: false
          }
        })
        this.status = TaskStatus.waiting
        this._then && this._then()
      })
  }
}

module.exports = { Task }
