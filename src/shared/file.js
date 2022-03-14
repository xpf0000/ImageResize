const fs = require('fs')
const path = require('path')

export function getAllFile(fp, fullpath = true) {
  let arr = []
  if (fs.statSync(fp).isFile()) {
    return [fp]
  }
  let files = fs.readdirSync(fp)
  files.forEach(function (item) {
    let fPath = path.join(fp, item)
    let stat = fs.statSync(fPath)
    if (stat.isDirectory()) {
      let sub = getAllFile(fPath, fullpath)
      arr = arr.concat(sub)
    }
    if (stat.isFile()) {
      arr.push(fullpath ? fPath : item)
    }
  })
  return arr
}

export function getAllFileAsync(fp, fullpath = true) {
  return new Promise((resolve) => {
    fs.stat(fp, (_, stat) => {
      if (stat.isFile()) {
        resolve([fp])
      } else if (stat.isDirectory()) {
        let arr = []
        let subs = []
        fs.readdir(fp, (_, paths) => {
          paths.forEach((item, index) => {
            let fPath = path.join(fp, item)
            fs.stat(fPath, (_, stat) => {
              if (stat.isDirectory()) {
                subs.push(getAllFileAsync(fPath, fullpath))
              }
              if (stat.isFile()) {
                arr.push(fullpath ? fPath : item)
              }
              if (index === paths.length - 1) {
                if (subs.length > 0) {
                  Promise.all(subs).then((arrs) => {
                    arr = arr.concat(...arrs)
                    resolve(arr)
                  })
                } else {
                  resolve(arr)
                }
              }
            })
          })
        })
      }
    })
  })
}
