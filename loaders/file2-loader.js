const {
  getOptions,
  interpolateName
} = require('loader-utils')

function loader(source) {
  const options = getOptions(this) || {}
  const filename = options.filename || '[name].[hash].[ext]'
  // 计算图片的hash的文件名
  const outputFileName = interpolateName(this, filename, {
    content: source
  })
  // 发送文件到打包后的文件夹。
  this.emitFile(outputFileName, source)
  return `module.exports = ${JSON.stringify(outputFileName)}`
}
// loader.raw = true 使 source变成二进制。默认是字符串
loader.raw = true;
module.exports = loader;