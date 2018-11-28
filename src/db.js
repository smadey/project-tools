import fs from 'fs'
import path from 'path'
import { remote } from 'electron'

const db = ((file) => {
  const writeFile = (data) => {
    return fs.writeFileSync(file, JSON.stringify(data, null, 2))
  }
  const readFile = () => {
    if (fs.existsSync(file)) {
      const data = fs.readFileSync(file, 'utf-8')
      return data ? JSON.parse(data) : {}
    } else {
      writeFile({})
      return {}
    }
  }

  const _ = window._.runInContext()
  const db = _.chain({})

  _.prototype.write = _.wrap(_.prototype.value, function(func) {
    return db.write(func.apply(this))
  })

  db._ = _

  db.getState = () => db.__wrapped__

  db.setState = (state) => {
    db.__wrapped__ = state
    return db
  }

  db.read = () => db.setState(readFile())

  db.write = (returnValue) => {
    writeFile(db.getState())
    return returnValue
  }

  return db.read()
})(path.join(remote.app.getPath('userData'), 'db.json'))

const models = [
  {
    name: 'project',
    primaryKey: 'id',
    defaults: [],
  }
]

const defaults = models.reduce((obj, model) => ({
  ...obj,
  [`${model.name}s`]: model.defaults,
}), {})
db.defaults(defaults).write()

models.forEach((model) => {
  const docs = db.get(`${model.name}s`)

  db[model.name] = {
    list(condition) {
      return Promise.resolve(docs.filter(condition).value())
    },
    get(condition) {
      return Promise.resolve(docs.find(condition).value())
    },
    save(data) {
      const condition = { [model.primaryKey]: data[model.primaryKey] }
      let doc = docs.find(condition)
      if (doc.value()) {
        doc.assign(data).write()
      } else {
        docs.push(data).write()
        doc = docs.find(condition)
      }
      return Promise.resolve(doc.value())
    },
    remove(condition) {
      const doc = docs.find(condition).value()
      docs.remove(condition).write()
      return Promise.resolve(doc)
    },
  }
})

export default db
