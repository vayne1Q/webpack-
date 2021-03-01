const path = require('path');
const {
  getOptions
} = require('loader-utils')
const postcss = require('postcss')
const Spritesmith = require('spritesmith')
const Tokenizer = require('css-selector-tokenizer')


function loader(inputSource) {
  let loaderContext = this;
  let callback = this.async()

  function createPlugin(postcssOptions) {
    return function (css) {
      css.walkDecls((decl) => {
        let values = Tokenizer.parseValues(decl.value)
        values.nodes.forEach(value => {
          value.nodes.forEach(item => {
            if (item.type === 'url' && item.url.endsWith('?sprite')) {
              let url = path.resolve(loaderContext.context, item.url);
              item.url = postcssOptions.spriteFileName
              postcssOptions.rules.push({
                url,
                rule: decl.parent
              })
            }
          })
        })
        decl.value = Tokenizer.stringifyValues(values)
      })
      postcssOptions.rules.map(v => v.rule).forEach((rule, index) => {
        rule.append(postcss.decl({
          prop: 'background-position',
          value: `_BACKGROUND_POSITION_${index}_`
        }))
      })
    }
  }
  let postcssOptions = {
    spriteFileName: 'sprite.jpg',
    rules: []
  }
  let pipeline = postcss([createPlugin(postcssOptions)])
  pipeline.process(inputSource, {
    from: undefined
  }).then(result => {
    let cssStr = result.css;
    let sprites = postcssOptions.rules.map(v => v.url.slice(0, v.url.lastIndexOf('?')))

    Spritesmith.run({
      src: sprites
    }, (err, spriteResult) => {
      let coordinates = spriteResult.coordinates;
      Object.keys(coordinates).forEach((key, index) => {
        cssStr = cssStr.replace(`_BACKGROUND_POSITION_${index}_`, `-${coordinates[key].x}px  -${coordinates[key].y}px`)
      })
      loaderContext.emitFile(postcssOptions.spriteFileName, spriteResult.image)
      callback(null, `module.exports = ${JSON.stringify(cssStr)}`)
    })
    // cssStr.replace()
    // console.log(result.css, '----------------')

  })
}
loader.raw = true;
module.exports = loader;