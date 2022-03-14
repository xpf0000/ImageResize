const TaskManager = require('./TaskManager.js')

let task = new TaskManager()
process.on('message', function (args) {
  task.exec(args)
})
