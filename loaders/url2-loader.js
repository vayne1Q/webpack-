const {
  getOptions,
  interpolateName // 重命名
} = require('loader-utils')
const mime = require('mime')

// module.exports导出的时候需要JSON.stringify一下。要不然导出的就是个变量了。
function loader(source) {
  let {
    filename = '[name].[hash].[ext]',
      limit = 1024 * 30
  } = getOptions(this) || {}
  // source是二进制。所以length就是字节数
  if (source.length < limit) {
    let contentType = mime.getType(this.resource);
    console.log(contentType, this.resource, this)
    let base64 = `data:${contentType};base64,${source.toString('base64')}`;
    return `module.exports = ${JSON.stringify(base64)}`
  } else {
    // 生成文件的名字
    const outputFileName = interpolateName(this, filename, {
      content: source
    })
    // 发送文件到打包后的文件夹。
    this.emitFile(outputFileName, source)
    return `module.exports = ${JSON.stringify(outputFileName)}`
  }

}
loader.raw = true;
module.exports = loader;