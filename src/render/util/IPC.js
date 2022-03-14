import { ipcRenderer } from '../global.js'
import { uuid } from './Index.js'
import { EventBus } from '../global.js'
class IPC {
  constructor() {
    ipcRenderer.on('command', (e, command, key, ...args) => {
      console.log('command: ', command, key, args)
      if (typeof key === 'string' && key.indexOf('IPC-Key-') === 0) {
        EventBus.emit(key, ...args)
      } else {
        EventBus.emit(command, key, ...args)
      }
    })
  }
  send(command, ...args) {
    return new Promise((resolve) => {
      const key = 'IPC-Key-' + uuid()
      EventBus.once(key, (...res) => {
        resolve(...res)
      })
      ipcRenderer.send('command', command, key, ...args)
    })
  }
  on(channel) {
    return new Promise((resolve) => {
      ipcRenderer.on(channel, (e, ...args) => {
        resolve(...args)
      })
    })
  }
}
export default new IPC()
