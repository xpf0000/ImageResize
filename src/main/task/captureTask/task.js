import { fork } from 'child_process'
import { resolve } from 'path'

class Task {
  start() {
    if (!this.fork) {
      this.fork = fork(resolve(__dirname, 'static/fork/captureTask/index.js'))
    }
  }

  setRect(rect) {
    this.fork.send(['setRect', rect])
  }

  run() {
    this.fork.send(['run'])
  }

  stop() {
    this.fork.disconnect()
    this.fork.kill()
  }
}

export default new Task()
