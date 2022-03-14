import { EventEmitter } from 'events'
import { app, ipcMain } from 'electron'
import is from 'electron-is'
import { isEmpty } from 'lodash'
import logger from './core/Logger'
import ConfigManager from './core/ConfigManager'
import AutoLaunchManager from './core/AutoLaunchManager'
import WindowManager from './ui/WindowManager'
import MenuManager from './ui/MenuManager'
import TouchBarManager from './ui/TouchBarManager'
import DockManager from './ui/DockManager'
import ThemeManager from './ui/ThemeManager'
import UpdateManager from './core/UpdateManager'
import { fork } from 'child_process'
import { resolve } from 'path'

export default class Application extends EventEmitter {
  constructor() {
    super()
    this.isReady = false
    this.init()
  }

  init() {
    this.configManager = new ConfigManager()
    this.locale = this.configManager.getLocale()
    this.menuManager = new MenuManager()
    this.menuManager.setup(this.locale)
    this.initTouchBarManager()
    this.initWindowManager()
    this.dockManager = new DockManager({
      runMode: this.configManager.getUserConfig('run-mode')
    })
    this.autoLaunchManager = new AutoLaunchManager()
    this.initThemeManager()
    this.initUpdaterManager()
    this.handleCommands()
    this.handleIpcMessages()

    this.taskManager = fork(resolve(__dirname, 'static/fork/task/index.js'))
    this.taskManager.on('message', ({ command, info }) => {
      console.log('child message: ', command, info)
      this.sendCommandToAll(command, 'IPC-Key-' + command, info)
    })
  }

  initWindowManager() {
    this.windowManager = new WindowManager({
      configManager: this.configManager
    })

    this.windowManager.on('window-resized', (data) => {
      this.storeWindowState(data)
    })
    this.windowManager.on('window-moved', (data) => {
      this.storeWindowState(data)
    })
    this.windowManager.on('window-closed', (data) => {
      this.storeWindowState(data)
    })
  }

  storeWindowState(data = {}) {
    const enabled = this.configManager.getUserConfig('keep-window-state')
    if (!enabled) {
      return
    }
    const state = this.configManager.getUserConfig('window-state', {})
    const { page, bounds } = data
    const newState = {
      ...state,
      [page]: bounds
    }
    this.configManager.setUserConfig('window-state', newState)
  }

  start(page, options = {}) {
    this.showPage(page, options)
    this.mainWindow.setIgnoreMouseEvents(false)
  }

  showPage(page, options = {}) {
    const { openedAtLogin } = options
    const win = this.windowManager.openWindow(page, {
      hidden: openedAtLogin
    })
    this.mainWindow = win
    win.once('ready-to-show', () => {
      this.isReady = true
      this.emit('ready')
    })
    if (is.macOS()) {
      this.touchBarManager.setup(page, win)
    }
  }

  show(page = 'index') {
    this.windowManager.showWindow(page)
  }

  hide(page) {
    if (page) {
      this.windowManager.hideWindow(page)
    } else {
      this.windowManager.hideAllWindow()
    }
  }

  toggle(page = 'index') {
    this.windowManager.toggleWindow(page)
  }

  closePage(page) {
    this.windowManager.destroyWindow(page)
  }

  stop() {
    logger.info('[WebMaker] application stop !!!')
    this.stopServer()
  }

  stopServer() {}

  sendCommand(command, ...args) {
    if (!this.emit(command, ...args)) {
      const window = this.windowManager.getFocusedWindow()
      if (window) {
        this.windowManager.sendCommandTo(window, command, ...args)
      }
    }
  }

  sendCommandToAll(command, ...args) {
    if (!this.emit(command, ...args)) {
      this.windowManager.getWindowList().forEach((window) => {
        this.windowManager.sendCommandTo(window, command, ...args)
      })
    }
  }

  sendMessageToAll(channel, ...args) {
    this.windowManager.getWindowList().forEach((window) => {
      this.windowManager.sendMessageTo(window, channel, ...args)
    })
  }

  initThemeManager() {
    this.themeManager = new ThemeManager()
    this.themeManager.on('system-theme-changed', (theme) => {
      this.sendCommandToAll('application:system-theme', 'application:system-theme', theme)
    })
  }

  initUpdaterManager() {
    if (is.mas()) {
      return
    }
    try {
      this.updateManager = new UpdateManager({})
      this.handleUpdaterEvents()
    } catch (err) {
      console.log('initUpdaterManager err: ', err)
    }
  }

  initTouchBarManager() {
    if (!is.macOS()) {
      return
    }
    this.touchBarManager = new TouchBarManager()
  }

  relaunch() {
    this.stop()
    app.relaunch()
    app.exit()
  }

  handleCommands() {
    this.on('application:save-preference', (config) => {
      console.log('application:save-preference.config====>', config)
      const { system, user } = config
      if (!isEmpty(system)) {
        console.info('[WebMaker] main save system config: ', system)
        this.configManager.setSystemConfig(system)
      }
      if (!isEmpty(user)) {
        console.info('[WebMaker] main save user config: ', user)
        this.configManager.setUserConfig(user)
      }
    })
    this.on('application:relaunch', () => {
      this.relaunch()
    })

    this.on('application:exit', () => {
      this.stop()
      app.exit()
    })

    this.on('application:open-at-login', (openAtLogin) => {
      console.log('application:open-at-login===>', openAtLogin)
      if (is.linux()) {
        return
      }

      if (openAtLogin) {
        this.autoLaunchManager.enable()
      } else {
        this.autoLaunchManager.disable()
      }
    })

    this.on('application:show', (page) => {
      this.show(page)
    })

    this.on('application:hide', (page) => {
      this.hide(page)
    })

    this.on('application:reset', () => {
      this.configManager.reset()
      this.relaunch()
    })

    this.on('application:change-theme', (theme) => {
      this.themeManager.updateAppAppearance(theme)
      this.sendCommandToAll('application:theme', 'application:theme', theme)
    })

    this.on('application:toggle-dock', (visible) => {
      if (visible) {
        this.dockManager.show()
      } else {
        this.dockManager.hide()
        // Hiding the dock icon will trigger the entire app to hide.
        this.show()
      }
    })

    this.on('application:change-menu-states', (visibleStates, enabledStates, checkedStates) => {
      this.menuManager.updateMenuStates(visibleStates, enabledStates, checkedStates)
    })

    this.on('application:window-size-change', (size) => {
      console.log('application:window-size-change: ', size)
      this.windowManager.getFocusedWindow().setSize(size.width, size.height, true)
    })

    this.on('application:window-open-new', (page) => {
      console.log('application:window-open-new: ', page)
    })

    this.on('application:check-for-updates', () => {
      this.updateManager.check()
    })
  }

  handleIpcMessages() {
    ipcMain.on('command', (event, command, key, ...args) => {
      this.emit(command, ...args)
      let window
      switch (command) {
        case 'Application:APP-Minimize':
          this.windowManager.getFocusedWindow().minimize()
          break
        case 'Application:APP-Maximize':
          window = this.windowManager.getFocusedWindow()
          if (window.isMaximized()) {
            window.unmaximize()
          } else {
            window.maximize()
          }
          break
        case 'Application:APP-Close':
          this.windowManager.getFocusedWindow().close()
          break
        case 'App:Task-Run':
          const arrs = args[0]
          console.log('App:Task-Run: ', arrs)
          this.taskManager.send(['run', arrs])
          break
      }
    })
    ipcMain.on('event', (event, eventName, ...args) => {
      console.log('receive event', eventName, ...args)
      this.emit(eventName, ...args)
    })
  }

  handleUpdaterEvents() {
    this.updateManager.on('checking', () => {
      this.menuManager.updateMenuItemEnabledState('app.check-for-updates', false)
    })

    this.updateManager.on('download-progress', (event) => {
      const win = this.windowManager.getWindow('index')
      win.setProgressBar(event.percent / 100)
    })

    this.updateManager.on('update-not-available', () => {
      this.menuManager.updateMenuItemEnabledState('app.check-for-updates', true)
    })

    this.updateManager.on('update-downloaded', () => {
      this.menuManager.updateMenuItemEnabledState('app.check-for-updates', true)
      const win = this.windowManager.getWindow('index')
      win.setProgressBar(0)
    })

    this.updateManager.on('will-updated', () => {
      this.windowManager.setWillQuit(true)
    })

    this.updateManager.on('update-error', () => {
      this.menuManager.updateMenuItemEnabledState('app.check-for-updates', true)
    })
  }
}
