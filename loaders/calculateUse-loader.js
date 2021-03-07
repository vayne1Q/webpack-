const loaderUtils = require('loader-utils')
const parser = require('@babel/parser')

const total = {
  len: 0,
  components: {}
}
const sortable = (obj) =>
  Object.fromEntries(Object.entries(obj).sort(([, a], [, b]) => b - a))
function loader(source) {
  const options = loaderUtils.getOptions(this)
  const { packageName = '' } = options
  const callback = this.async()
  if (!packageName) return callback(null, source)

  let ast = parser.parse(source, {
    sourceType: 'module',
    plugins: ['jsx']
  })

  try {
    if (ast) {
      setTimeout(() => {
        console.log(ast)
        const getImport = 'ImportDeclaration'
        const getMaterialImport = packageName
        const importAst = ast.program.body.filter(
          // type 节点类型，这里我们去过滤 import 声明类型 同时去过滤
          (i) =>
            i.type === getImport && i.source.value.includes(getMaterialImport)
        )
        total.len = total.len + importAst.length

        /**
         * import { Button as Button1 } from '@pd/pd'  type === 'ImportSpecifier'
         * import { Button } from '@pd/pd'  type === 'ImportSpecifier'
         * import Autocomplete from '@material-ui/lab/Autocomplete';  type === 'ImportDefaultSpecifier'
         * 一共有这三种导入的情况。
         */
        for (let i of importAst) {
          const { specifiers = [] } = i
          for (let s of specifiers) {
            let name = ''
            if (s.type === 'ImportSpecifier') {
              if (s.imported) {
                name = s.imported.name
              }
            } else if (s.type === 'ImportDefaultSpecifier') {
              if (s.local) {
                name = s.local.name
              }
            }
            total.components[name] = total.components[name]
              ? total.components[name] + 1
              : 1
          }
        }
        total.components = sortable(total.components)
        console.log(total, 'total')
        callback(null, source)
      })
    } else {
      return callback(null, source)
    }
  } catch (error) {
    callback(error, source)
  }
}

module.exports = loader
