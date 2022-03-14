import { app } from 'electron'
import is from 'electron-is'
import Store from 'electron-store'
import { getLogPath, getSessionPath } from '../utils/index'
import Os from '../utils/os'

export default class ConfigManager {
  constructor() {
    this.systemConfig = {}
    this.userConfig = {}
    this.init()
    this.setSystemConfig('OS', Os.info())
  }

  init() {
    this.initSystemConfig()
    this.initUserConfig()
  }

  initSystemConfig() {
    this.systemConfig = new Store({
      name: 'system',
      defaults: {
        'rpc-listen-port': 16800,
        'rpc-secret': '',
        OS: Os.info()
      }
    })
  }

  initUserConfig() {
    this.userConfig = new Store({
      name: 'user',
      defaults: {
        'auto-check-update': is.macOS(),
        'hide-app-menu': is.windows() || is.linux(),
        'last-check-update-time': 0,
        locale: app.getLocale(),
        'log-path': getLogPath(),
        'open-at-login': false,
        'run-mode': 1,
        'keep-window-state': true,
        'session-path': getSessionPath(),
        theme: 'auto',
        'update-channel': 'latest',
        'window-state': {},
        AppRoute: {
          path: 'projectList'
        },
        password: ''
      }
    })
    console.log('userConfig: ', this.userConfig.get('AppRoute'))
    this.fixUserConfig()
  }

  fixUserConfig() {}

  getSystemConfig(key, defaultValue) {
    if (typeof key === 'undefined' && typeof defaultValue === 'undefined') {
      return this.systemConfig.store
    }

    return this.systemConfig.get(key, defaultValue)
  }

  getUserConfig(key, defaultValue) {
    if (typeof key === 'undefined' && typeof defaultValue === 'undefined') {
      return this.userConfig.store
    }

    return this.userConfig.get(key, defaultValue)
  }

  getLocale() {
    return this.getUserConfig('locale') || app.getLocale()
  }

  setSystemConfig(...args) {
    this.systemConfig.set(...args)
  }

  setUserConfig(...args) {
    this.userConfig.set(...args)
  }

  reset() {
    this.systemConfig.clear()
    this.userConfig.clear()
  }
}
