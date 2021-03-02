// const { runLoaders } = require('loader-runner');

// -! noPreAutoLoaders  不要前置loader，普通loader，只剩下内联loader，后置loader
// ! noAutoLoaders 不要普通的loader,其他都要
// !! noPrePostAutoLoaders 不要前置，后置，普通loader，只要内联loader

const path = require('path')
const fs = require('fs')
let isSync = true // 默认同步
// 创建loader对象
function createLoaderObject(loaderPath) {
  const obj = {
    data: {} // 用来在pitch和normal传递数据
  }
  obj.request = loaderPath // 这个参数是loader的绝对路径
  const loaderFn = require(loaderPath) // 加载这个模块
  obj.normal = loaderFn // normal  存放普通对象
  obj.pitch = loaderFn.pitch // 拿到pitch方法
  return obj
}
/** 迭代loader的pitch方法  */
function iteratePitchingLoaders(loaderContext, callback) {
  // 走完了
  if (loaderContext.loaderIndex >= loaderContext.loaders.length) {
    loaderContext.loaderIndex-- // 走完往回走
    // 先读文件,然后往回走
    return processResource(loaderContext, callback)
  }
  // 没有走完，继续走
  // 拿到当前loader对象
  const currentLoaderObj = loaderContext.loaders[loaderContext.loaderIndex]
  // 拿到pitch方法
  const pitchFn = currentLoaderObj.pitch
  // 没有pitch，下一个
  if (!pitchFn) {
    loaderContext.loaderIndex++ // 下一个pitch
    return iteratePitchingLoaders(loaderContext, callback) // 继续调用
  }
  // loader1!loader2!loader3!hello.js
  // remindingRequest!loader3!hello.js remindingRequest除了自己之后的
  // previousRequest === loader1 前面一个,就是前一个执行的pitch相关的
  const result = pitchFn.apply(loaderContext, [
    // 执行pitch function,获得结果，可能没有结果
    loaderContext.remindingRequest,
    loaderContext.previousRequest,
    loaderContext.data
  ])
  // 有值，停止走下一个pitch，把值给上一个pitch对应的的normal loader方法
  if (result) {
    loaderContext.loaderIndex-- // 返回上一个，然后调用normal function
    iterateNormalLoaders(loaderContext, result, callback) // 迭代正常的loader
  } else {
    // 没值，继续走
    loaderContext.loaderIndex++ // 下一个
    return iteratePitchingLoaders(loaderContext, callback)
  }
}
// 读取文件
function processResource(loaderContext, callback) {
  // 加载模块代码，获取内容 [默认是buffer]
  let result = loaderContext.readResource(loaderContext.resource)
  // 默认的raw，不是true的话，就取反，改成字符串
  if (!loaderContext.loaders[loaderContext.loaderIndex].normal.raw) {
    result = result.toString('utf-8')
  }
  // 把结果传递下去
  iterateNormalLoaders(loaderContext, result, callback)
}
// 执行normal 方法 就是普通的loader方法
function iterateNormalLoaders(loaderContext, result, callback) {
  // 越界了，到头了
  if (loaderContext.loaderIndex < 0) {
    return callback(null, result)
  }
  const currentLoaderObj = loaderContext.loaders[loaderContext.loaderIndex]
  // 拿到normal方法
  const normalFn = currentLoaderObj.normal
  // 执行，获得返回结果给下一个
  result = normalFn.apply(loaderContext, [result])
  // 如果是同步就继续走，异步就不执行下面的，让asyncCallback方法执行
  if (isSync) {
    // 执行后,执行上一个
    loaderContext.loaderIndex--
    iterateNormalLoaders(loaderContext, result, callback)
  } else {
    // 执行完毕后又置成同步
    isSync = true
  }
}
// 定义属性的
function defineProperty(loaderContext) {
  // 定义属性 request 完整资源的路径数组
  Object.defineProperty(loaderContext, 'request', {
    get() {
      //  loader1!loader2!loader3!hello.js
      return loaderContext.loaders
        .map((loader) => loader.request)
        .concat([loaderContext.resource])
        .join('!')
    }
  })
  // 定义属性 remindingRequest 获取当前和前面的除外，到最后
  Object.defineProperty(loaderContext, 'remindingRequest', {
    get() {
      //  loader3!hello.js
      return loaderContext.loaders
        .slice(loaderContext.loaderIndex + 1)
        .map((loader) => loader.request)
        .concat([loaderContext.resource])
        .join('!')
    }
  })
  // 定义属性 previousRequest 获取当前除外前面所有的
  Object.defineProperty(loaderContext, 'previousRequest', {
    get() {
      //  loader1
      return loaderContext.loaders
        .slice(0, loaderContext.loaderIndex)
        .map((loader) => loader.request)
        .join('!')
    }
  })
  // 定义属性 currentRequest 获取当前的
  Object.defineProperty(loaderContext, 'currentRequest', {
    get() {
      //  loader2!loader3!hello.js
      return loaderContext.loaders
        .slice(loaderContext.loaderIndex)
        .map((loader) => loader.request)
        .concat([loaderContext.resource])
        .join('!')
    }
  })
  Object.defineProperty(loaderContext, 'data', {
    get() {
      //  data属性，默认是{}
      return loaderContext.loaders[loaderContext.loaderIndex].data
    }
  })
}

function runLoaders(options, callback) {
  try {
    const loaderContext = options.context || {} // loader的上下文环境
    loaderContext.resource = options.resource // 加载的资源
    // 使用的loader,map成对象后赋值给context上
    loaderContext.loaders = options.loaders.map(createLoaderObject)
    loaderContext.readResource = options.readResource // fs模块放入
    loaderContext.loaderIndex = 0 // 索引
    defineProperty(loaderContext) // 执行给context增加属性
    // 给loaderContext加方法
    loaderContext.async = function () {
      isSync = false // 转化成异步
      return asyncCallback // 返回一个异步回调
    }
    // 返回异步的回调函数
    function asyncCallback(error, result) {
      if (error) {
        // 有错误
        return callback(error)
      }
      loaderContext.loaderIndex--
      iterateNormalLoaders(loaderContext, result, callback)
    }
    // 开始迭代，从左往右，然后从右往左
    // 迭代loader的pitch方法
    iteratePitchingLoaders(loaderContext, callback)
  } catch (error) {
    // 出错了
    callback(error)
  }
}

runLoaders(
  {
    // 要加载的资源
    resource: path.resolve(__dirname, './src/hello.js'),
    // 我们要用这三个loader转化hello.js
    loaders: [
      path.resolve('loaders', 'loader1.js'),
      path.resolve('loaders', 'loader2.js'),
      path.resolve('loaders', 'loader3.js')
    ],
    context: {
      minimize: true
    },
    readResource: fs.readFileSync.bind(fs)
  },
  function (err, result) {
    if (err) {
      console.log(err)
    }
    console.log(result)
  }
)
