const { Task } = require('./Task.js')
const EventBus = require('./EventBus.js')

class TaskManager {
  constructor() {
    this.taskPool = []
    this.maxCount = 4
    this.queue = []
    this.end = true
    for (let i = 0; i < this.maxCount; i += 1) {
      const task = new Task()
      task.taskId = i
      task.then(() => {
        const id = this.queue.shift()
        if (id) {
          task.run(id)
        } else {
          if (!this.end) {
            this.end = true
            process.send({ command: 'Task:task-end', info: true })
          }
        }
      })
      this.taskPool.push(task)
    }
  }

  exec(commands) {
    let fn = commands[0]
    commands.splice(0, 1)
    if (this[fn]) {
      this[fn](...commands)
    }
  }

  run(queue) {
    this.end = false
    this.queue = queue
    EventBus.emit('Task-Run')
  }
}

module.exports = TaskManager
