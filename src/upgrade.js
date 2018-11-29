import fs from 'fs'
import https from 'https'
import path from 'path'

import { remote } from 'electron'

const appPath = remote.app.getAppPath()

export default ({ confirm }) => {
  return Promise.all([
    readLocalFile('package.json').then(parseJSON),
    loadRemoteFile('package.json').then(parseJSON),
  ]).then(([localPkg, remotePkg]) => {
    if (compare(localPkg.version, '<', remotePkg.version)) {
      const files = ['package.json', 'background.js', 'index.html']

      const srcDir = appPath
      const tmpdir = `${appPath}_${remotePkg.version}`

      return confirm(remotePkg).then(() => {
        return Promise.all(files.map((file) => {
          return loadRemoteFile(file).then((content) => {
            if (!fs.existsSync(tmpdir)) {
              fs.mkdirSync(tmpdir)
            }
            fs.writeFileSync(path.join(tmpdir, file), content)
          })
        })).then(() => {
          return copy(tmpdir, srcDir).then(() => ({ status: 'success' }))
        })
      }, () => {
        return { status: 'cancel' }
      })
    }
    return { status: 'latest' }
  })
}

function readLocalFile(file) {
  const url = path.join(appPath, file)
  if (fs.existsSync(url)) {
    return Promise.resolve(fs.readFileSync(url).toString())
  }
  return Promise.reject(new Error(`本地文件 "${file}" 文件不存在`))
}

function loadRemoteFile(file) {
  const url = `https://raw.githubusercontent.com/smadey/project-tools/master/dist_electron/bundled/${file}?v=${Math.random()}`
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const status = res.statusCode
      if (status !== 200) {
        res.resume()
        return reject(new Error(`"${file}" 获取失败，错误码: ${status}`))
      }
      res.setEncoding('utf8')

      let data = ''
      res
        .on('data', (chunk) => {
          data += chunk
        })
        .on('end', () => resolve(data))
        .on('error', err => reject(err))
    })
  })
}

function copy(src, dest) {
  if (!fs.existsSync(src)) {
    return Promise.resolve()
  }

  return Promise.all(
    fs.readdirSync(src).map((file) => {
      const srcFile = path.join(src, file)
      const destFile = path.join(dest, file)

      return new Promise((resolve, reject) => {
        fs.stat(srcFile, (err, stat) => {
          if (err) {
            return reject(err)
          }

          if (stat.isFile()) {
            fs.copyFile(srcFile, destFile, (err) => {
              if (err) {
                return reject(err)
              }
              resolve()
            })
          } else {
            copy(srcFile, destFile)
          }
        })
      })
    })
  )
}

function parseJSON(res) {
  try {
    res = JSON.parse(res)
  } catch (err) {
    return Promise.reject(err)
  }
  return res
}

/**
 * 比较版本号
 * @param  {String} ver1 版本号1
 * @param  {String} operator 比较运算符(>|>=|<|<=|==)
 * @param  {String} ver2 版本号2
 * @return {Boolean}
 */
function compare(ver1, operator, ver2) {
  const arr1 = String(ver1).split('.')
  const arr2 = String(ver2).split('.')

  let res = 0

  const len = Math.max(arr1.length, arr2.length)
  let i

  let l
  let r

  for (i = 0; i < len; i++) {
    l = (isFinite(arr1[i]) && Number(arr1[i])) || 0
    r = (isFinite(arr2[i]) && Number(arr2[i])) || 0

    if (l < r) {
      res = -1
      break
    } else if (l > r) {
      res = 1
      break
    }
  }

  switch (operator) {
    case '>':
      return res > 0
    case '>=':
      return res >= 0
    case '<':
      return res < 0
    case '<=':
      return res < 1
  }
  return res === 0
}
