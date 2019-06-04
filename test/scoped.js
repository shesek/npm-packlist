'use strict'
const fs = require('fs')
const path = require('path')

const pack = require('../')

const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const t = require('tap')

const pkg = path.join(__dirname, path.basename(__filename, '.js'))
t.teardown(_ => rimraf.sync(pkg))

const elfJS = `
module.exports = elf =>
  console.log("i'm a elf")
`

const json = {
  'name': 'test-package-scoped',
  'version': '3.1.4',
  'main': 'elf.js',
  'bundledDependencies': [
    '@npmwombat/scoped'
  ]
}

t.test('setup', t => {
  rimraf.sync(pkg)
  mkdirp.sync(pkg)
  fs.writeFileSync(
    path.join(pkg, 'package.json'),
    JSON.stringify(json, null, 2)
  )

  fs.writeFileSync(
    path.join(pkg, 'elf.js'),
    elfJS
  )

  const scopedDir = path.join(pkg, 'node_modules/@npmwombat/scoped')
  mkdirp.sync(scopedDir)
  fs.writeFileSync(
    path.join(scopedDir, 'index.js'),
    "console.log('hello wombat')"
  )

  const nobundle = path.join(pkg, 'node_modules/@ignore/scoped')
  mkdirp.sync(nobundle)
  fs.writeFileSync(
    path.join(nobundle, 'index.js'),
    "console.log('i do not want to be bundled')"
  )

  const nobundleWombat = path.join(pkg, 'node_modules/@npmwombat/no')
  mkdirp.sync(nobundleWombat)
  fs.writeFileSync(
    path.join(nobundleWombat, 'wombat.js'),
    "console.log('no bundle please')"
  )


  t.end()
})

t.test('includes bundledDependencies', function (t) {
  const check = (files, t) => {
    t.matchSnapshot(files)
    t.end()
  }

  const bundled = [ '@npmwombat/scoped' ]
  const options = {
    path: pkg,
    bundled: bundled
  }

  t.test('sync', t => check(pack.sync(options), t))
  t.test('async', t => pack(options).then(files => check(files, t)))

  t.end()
})
