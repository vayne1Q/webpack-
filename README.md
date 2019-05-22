# webpack-demo
webpack入门配置及实例


2019-5-21：

babel转化es6为es5语法：

	1.babel-loader只是沟通webpack跟babel之间的桥梁。 @babel/core为babel的核心库 。

	2.babel/preset-env包含了所有es6语法转化为es5语法的规则。

	3.@babe/polyfill解决低版本浏览器不兼容es6的语法。但是polyfill会在解决过程中以全局变量的形式污染全局。
	  所以当我们开发第三类库跟组件的时候需要引入@babel/runtime。他会以闭包的形式引入到我们项目中来

	4.当我们babel-loader的options的内容过多的时候。可以在根目录下创建一个.babelrc的文件。用来放options的内容。
    
    
   [@babel/runtime](https://www.babeljs.cn/docs/babel-plugin-transform-runtime)
   
   
详细配置
======

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

    react代码编译示例：

    对于.babelrc配置文件我们配置：

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