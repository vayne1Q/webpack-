const postcss = require('postcss')
const Tokenizer = require('css-selector-tokenizer')
const loaderUtils = require('loader-utils')
// 插件，用来提取url
function createPlugin(options) {
  return function (css) {
    const { importItems, urlItems } = options
    // 捕获导入,如果多个就执行多次
    css.walkAtRules(/^import$/, function (rule) {
      // 拿到每个导入
      const values = Tokenizer.parseValues(rule.params)
      // console.log(JSON.stringify(values));
      // {"type":"values","nodes":[{"type":"value","nodes":[{"type":"string","value":"./base.css","stringType":"'"}]}]}
      // 找到url
      const url = values.nodes[0].nodes[0] // 第一层的第一个的第一个
      importItems.push(url.value)
    })
    // 遍历规则，拿到图片地址
    css.walkDecls((decl) => {
      // 把value 就是 值 7.5px solid red
      // 通过Tokenizer.parseValues，把值变成了树结构
      const values = Tokenizer.parseValues(decl.value)
      values.nodes.forEach((value) => {
        value.nodes.forEach((item) => {
          /*
            { type: 'url', stringType: "'", url: './bg.jpg', after: ' ' }
            { type: 'item', name: 'center', after: ' ' }
            { type: 'item', name: 'no-repeat' }
          */
          if (item.type === 'url' && !item.url.includes(options.filename)) {
            const url = item.url
            item.url = `_CSS_URL_${urlItems.length}_`
            urlItems.push(url) // ['./bg.jpg']
          }
        })
      })
      decl.value = Tokenizer.stringifyValues(values) // 转回字符串
    })
    return css
  }
}

// css-loader是用来处理，解析@import "base.css"; url('./assets/logo.jpg')
module.exports = function loader(source, prevOptions) {
  const callback = this.async()
  // 开始处理
  const options = {
    importItems: [],
    urlItems: [],
    ...prevOptions
  }
  // 插件转化，然后把url路径都转化成require('./bg.jpg'); // ...
  const pipeline = postcss([createPlugin(options)])
  // 1rem 75px
  pipeline
    //   .process("background: url('./bg.jpg') center no-repeat;")
    .process(source, { from: undefined })
    .then((result) => {
      // 拿到导入路径，拼接
      const importCss = options.importItems
        .map((imp) => {
          // stringifyRequest 可以把绝对路径转化成相对路径
          return `require(${loaderUtils.stringifyRequest(this, imp)})` // 拼接
        })
        .join('\n') // 拿到一个个import
      let cssString = JSON.stringify(result.css) // 包裹后就是"xxx" 双引号
      cssString = cssString.replace(/@import\s+?["'][^'"]+?["'];/g, '')
      cssString = cssString.replace(
        /_CSS_URL_(\d+?)_/g,
        function (matched, group1) {
          // 索引拿到，然后拿到这个,替换掉原来的_CSS_URL_0_哪些
          const imgURL = options.urlItems[+group1]
          // console.log('图片路径', imgURL);
          // "background: url('"+require('./bg.jpg')+"') center no-repeat;"
          return `"+require('${imgURL}').default+"`
        }
      ) // url('_CSS_URL_1_')
      callback(
        null,
        `
        ${importCss}
        module.exports = ${cssString}
      `
      )
    })
}
