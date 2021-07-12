const Zip = require('jszip')
const { Compilation } = require('webpack')
const pluginName = 'JsZip'

class JsZip {
  constructor(options) {
    this.options = options
  }
  apply(compiler) {
    compiler.hooks.emit.tapAsync(pluginName, (compilation, callback) => {
      const zip = new Zip()
      for (let key in compilation.assets) {
        // 执行他们的source方法返回源数据
        zip.file(key, compilation.assets[key].source())
      }

      zip.generateAsync({ type: 'nodebuffer' }).then((content) => {
        // 对生成的压缩包文件赋值内容
        compilation.assets[this.options.name] = {
          source() {
            return content
          },
          size() {
            return content.length
          }
        }
        callback(null, compilation)
      })
    })
  }
}

module.exports = JsZip
