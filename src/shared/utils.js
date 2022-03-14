import { spawn } from 'child_process'

export function execAsync(command, arg = [], options = {}) {
  return new Promise((resolve, reject) => {
    // console.log('process.env: ', process.env)
    let optdefault = { env: process.env }
    if (!optdefault.env['PATH']) {
      optdefault.env['PATH'] = '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin'
    } else {
      if (optdefault.env['PATH'].indexOf('/usr/local/bin') < 0) {
        optdefault.env['PATH'] = `/usr/local/bin:${optdefault.env['PATH']}`
      }
    }
    let opt = { ...optdefault, ...options }
    const cp = spawn(command, arg, opt)
    let stdout = []
    let stderr = []
    cp.stdout.on('data', (data) => {
      stdout.push(data.toString().trim())
    })

    cp.stderr.on('data', (data) => {
      stderr.push(data.toString().trim())
    })

    cp.on('close', (code) => {
      if (code === 0) {
        resolve(stdout.join('\r\n'))
      } else {
        reject(stderr.join('\r\n'))
      }
    })
  })
}

export function uuid(length = 32) {
  const num = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
  let str = ''
  for (let i = 0; i < length; i++) {
    str += num.charAt(Math.floor(Math.random() * num.length))
  }
  return str
}
