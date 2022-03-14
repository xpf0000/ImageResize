import is from 'electron-is'
import { EventEmitter } from 'events'
import { app } from 'electron'

const isMac = is.macOS()

export default class DockManager extends EventEmitter {
  constructor(options) {
    super()
    this.options = options
    const { runMode } = this.options
    console.log('DockManager options', this.options)
    if (runMode !== 1) {
      this.hide()
    }
  }

  show() {
    return isMac && app.dock.show()
  }

  hide() {
    isMac && app.dock.hide()
  }

  setBadge(text) {
    isMac && app.dock.setBadge(text)
  }

  openDock(path) {
    isMac && app.dock.downloadFinished(path)
  }
}
