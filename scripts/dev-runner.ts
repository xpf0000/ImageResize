import { createServer } from 'vite'
import { spawn, ChildProcessWithoutNullStreams } from 'child_process'
import { build } from 'esbuild'
import _fs from 'fs-extra'
import _path from 'path'
// @ts-ignore
import _md5 from 'md5'

import viteConfig from '../configs/vite.config'
import esbuildConfig from '../configs/esbuild.config'

let electronProcess: ChildProcessWithoutNullStreams | null

async function launchViteDevServer(openInBrowser = false) {
  const config = openInBrowser ? viteConfig.serveConfig : viteConfig.serverConfig
  const server = await createServer({
    ...config,
    configFile: false
  })
  await server.listen()
}

async function buildMainProcess() {
  return build(esbuildConfig.dev)
    .then(
      () => {
        if (electronProcess && electronProcess.kill) {
          if (electronProcess.pid) {
            process.kill(electronProcess.pid)
          }
          electronProcess = null
        }
        console.log('buildMainProcess !!!!!!')
      },
      (err) => {
        console.log(err)
      }
    )
    .catch((e) => {
      return e
    })
}

function logPrinter(data: string[]) {
  let log = '\n'

  data = data.toString().split(/\r?\n/)
  data.forEach((line) => {
    log += `  ${line}\n`
  })

  if (/[0-9A-z]+/.test(log)) {
    console.log(log)
  }
}

function runElectronApp() {
  const args = ['--inspect=5858', 'dist/electron/main.js']
  electronProcess = spawn('electron', args, {
    stdio: 'pipe',
    shell: process.platform === 'win32'
  })

  electronProcess.stderr.on('data', (data) => {
    logPrinter(data)
  })

  electronProcess.stdout.on('data', (data) => {
    logPrinter(data)
  })

  electronProcess.on('close', () => {})
}

if (process.env.TEST === 'electron') {
  Promise.all([launchViteDevServer(), buildMainProcess()])
    .then(() => {
      runElectronApp()
    })
    .catch((err) => {
      console.error(err)
    })
}

if (process.env.TEST === 'browser') {
  launchViteDevServer(true).then(() => {
    console.log('Vite Dev Server Start !!!')
  })
}

// 监听main 文件改变
let preveMd5 = ''
let fsWait = false
const mainPath = _path.resolve(__dirname, '../src/main/')
_fs.watch(mainPath, (event, filename) => {
  if (filename) {
    if (fsWait) return
    const currentMd5 = _md5(_fs.readFileSync(_path.join(mainPath, filename)))
    if (currentMd5 == preveMd5) {
      return
    }
    fsWait = true
    preveMd5 = currentMd5
    console.log(`${filename}文件发生更新`)
    buildMainProcess()
      .then(() => {
        runElectronApp()
      })
      .catch((err) => {
        console.error(err)
      })
    setTimeout(() => {
      fsWait = false
    }, 500)
  }
})
