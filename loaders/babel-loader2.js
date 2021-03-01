let babel = require('@babel/core')
let loaderUtils = require('loader-utils')
let path = require('path')
process.noDeprecation = true

function loader(inputSource) {
  let options = {
    ...loaderUtils.getOptions(this), // 获取webpack配置loader的options
    sourceMaps: true, // 是否生成map文件
    filename: path.basename(this.resourcePath)
  }

  let {
    code, // 生成的代码
    map, // map
    ast // 生成的ast
  } = babel.transform(inputSource, options)

  return this.callback(null, code, map, ast) // 参数位置不能变
}

module.exports = loader;