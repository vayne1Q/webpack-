# webpack-demo
webpack4入门配置及实例


2019-5-21：
======

babel转化es6为es5语法：

	1.babel-loader只是沟通webpack跟babel之间的桥梁。 @babel/core为babel的核心库 。

	2.babel/preset-env包含了所有es6语法转化为es5语法的规则。

	3.@babe/polyfill解决低版本浏览器不兼容es6的语法。但是polyfill会在解决过程中以全局变量的形式污染全局。
	  所以当我们开发第三类库跟组件的时候需要引入@babel/runtime。他会以闭包的形式引入到我们项目中来

	4.当我们babel-loader的options的内容过多的时候。可以在根目录下创建一个.babelrc的文件。用来放options的内容。
    
    
   [@babel/runtime](https://www.babeljs.cn/docs/babel-plugin-transform-runtime)
   
   
详细配置

    {
        test: /\.js$/,
        exclude: /node_modules/,   // 对于node_modules里面的文件不需要转化
        loader: 'babel-loader',   // 沟通webpack跟babel之间的桥梁。 
        options: {
            presets: [['@babel/preset-env',{    // @babel/preset-env包含了所有es6语法转化为es5语法的规则。
                targets: {
                    chrome: '67',   // chrome67以上的浏览器版本不需要转es5语法
                },
                useBuiltIns: 'usage'    //  @babel/polyfill根据业务代码中出现的es6语法来做打包。减少打包的体积
            }]] 
        }
    }, 



2019-5-22：
======

    react代码用webpack编译示例：

    对于.babelrc配置文件我们配置：(配置文件执行顺序从下往上,从右往左)

    { 
        presets: [
            ['@babel/preset-env',{    // @babel/preset-env包含了所有es6语法转化为es5语法的规则。
                targets: {
                    chrome: '67', // chrome67以上的浏览器版本不需要转es5语法
                },
                useBuiltIns: 'usage'  //  @babel/polyfill根据业务代码中出现的es6语法来做打包。减少打包的体积
            }
            ],
            "@babel/preset-react"   // 对于react的代码。先用preset-react进行编译。然后用preset-env进行es5语法的转换
        ]
    }
    
    
    
2019-5-27：
======
    Tree shaking(过滤掉未通过import导入的模块。)(Tree shaking只支持esmodule模块的引入的模式)
    
    开发环境下。需要在webpack.config.js文件下设置:
    modules.exports = {
    	mode: 'development',
	optimization: {
            usedExports: true,
	},
    }
    
    
    生产环境下我们只需要将mode改成production就可以了：
    modules.exports = {
       mode: 'production'
    }
    
package.json配置：

    还需要在package.json里面的最上面设置
    "sideEffets": false,   // 如果设置了false就是对所有import引入的模块都进行Tree shaking。但是这样会产生问题如下。
    
    比如在main.js里面引入了import '@babel/poly-fill' 因为他没有导出一个方法。Tree shaking就会将它自动过滤掉。导致项目打包失败或者报错。
    这时候就需要更改配置
    
    "sideEffets": ["@babel/poly-fill"] // 对@babel/poly-fill不进行Tree shaking。这样就会成功了
