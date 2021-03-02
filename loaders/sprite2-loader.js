const path = require('path')
const { getOptions } = require('loader-utils')
const postcss = require('postcss')
const Spritesmith = require('spritesmith')
const Tokenizer = require('css-selector-tokenizer')

function loader(inputSource) {
  let loaderContext = this
  let callback = this.async()
  const options = getOptions(this)

  function createPlugin(postcssOptions) {
    return function (css) {
      css.walkDecls((decl) => {
        let values = Tokenizer.parseValues(decl.value)
        // 举例子拿两条。后面还有很多
        // {"type":"values","nodes":[{"type":"value","nodes":[{"type":"item","name":"red"}]}]}
        // {"type":"values","nodes":[{"type":"value","nodes":[{"type":"url","stringType":"'","url":"./img/1.jpg?sprite"}]}]}
        values.nodes.forEach((value) => {
          value.nodes.forEach((item) => {
            if (item.type === 'url' && item.url.endsWith('?sprite')) {
              // this.context是当前文件可执行的文件路径所在的文件夹
              let url = path.resolve(loaderContext.context, item.url)
              item.url = postcssOptions.spriteFileName
              postcssOptions.rules.push({
                url,
                rule: decl.parent
              })
            }
          })
        })
        // 将values改完之后重新赋值给value
        decl.value = Tokenizer.stringifyValues(values)
      })
      // 比如：
      // .one {
      //   background-image: url('./img/1.jpg?sprite');
      //   width: 300px;
      //   height: 300px;
      // }
      // rule.append就是给.one加一条css规则。postcss.decl 添加prop代表key。value就是值。
      postcssOptions.rules
        .map((v) => v.rule)
        .forEach((rule, index) => {
          rule.append(
            postcss.decl({
              prop: 'background-position',
              value: `_BACKGROUND_POSITION_${index}_`
            })
          )
        })
    }
  }
  let postcssOptions = {
    spriteFileName: options.outputPath + options.filename,
    rules: []
  }
  let pipeline = postcss([createPlugin(postcssOptions)])
  pipeline
    .process(inputSource, {
      from: undefined
    })
    .then((result) => {
      let cssStr = result.css
      let sprites = postcssOptions.rules.map((v) =>
        v.url.slice(0, v.url.lastIndexOf('?'))
      )

      // 合成雪碧图
      Spritesmith.run(
        {
          src: sprites
        },
        (err, spriteResult) => {
          let coordinates = spriteResult.coordinates
          Object.keys(coordinates).forEach((key, index) => {
            cssStr = cssStr.replace(
              `_BACKGROUND_POSITION_${index}_`,
              `-${coordinates[key].x}px  -${coordinates[key].y}px`
            )
          })
          loaderContext.emitFile(
            postcssOptions.spriteFileName,
            spriteResult.image
          )
          // callback(null, `module.exports = ${JSON.stringify(cssStr)}`)
          callback(null, cssStr, options)
        }
      )
    })
}
// loader.raw = true
module.exports = loader
