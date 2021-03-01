let loaderUtils = require('loader-utils')
let {
  validate
} = require('schema-utils')
let fs = require('fs')
let path = require('path')

process.noDeprecation = true

function loader(inputSource) {
  // 获取loader中的option内容
  let options = loaderUtils.getOptions(this)

  // 当在异步函数中需要返回值的时候。就用callback来进行返回。
  let callback = this.async()
  let schema = {
    type: 'object',
    properties: {
      text: {
        type: 'string'
      },
      filename: {
        type: 'string'
      }
    },
    required: ['filename'] // 必填字段
  }

  // 校验banner-loader的option必须有filename跟text属性
  validate(schema, options)

  let {
    filename
  } = options;
  fs.readFile(path.join(__dirname, filename), 'utf8', (err, data) => {
    // callback第一个值默认err。不填参数也可
    callback(null, `/** ${data} */` + inputSource)
  })
}

module.exports = loader;