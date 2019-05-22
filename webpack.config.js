const path = require('path'); // node包
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 打包之后的dist文件夹下生成html文件
const CleanWebpackPlugin = require('clean-webpack-plugin');// 每次打包之前清空dist文件夹。生成新的dist文件
const webpack = require('webpack');



module.exports = {
    mode: 'production', // 打包环境。（默认production。bundle.js代码压缩成一行）
    devtool: 'cheap-module-eval-source-map', // 是否开启source-map。module指的是对loader里面进行转换。
    devServer: { 
        contentBase: './dist',
        open: true,
        port: 8181,
        hot: true,  // 热更新模块（css|js文件不会重新请求locahost导致刷新页面）、且热加载的文件不会被打包到dist文件夹。而是放在内存中。
        hotOnly: true, // 不支持更新，或者热更新失败不会刷新页面
    },
    entry: {
        main: './src/index.js', // 入口文件
    },
    performance: {
        hints:false,        
    },  
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader', // 沟通webpack跟babel之间的桥梁。
            },
            {
                test: /\.(jpg|png|gif)$/,
                use: {
                    loader: 'url-loader', // 比file-loader功能多
                    options: {
                       name: '[name].[ext]',  // 输出图片文件的名字及拓展名字
                       outputPath: 'images/',  // 输出文件的路径在images下
                       limit: 10240,  // 图片文件超过10240的时候才会单独打包出一个图片放在dist文件夹中。小于10240就打包到bundle.js里
                    }
                }
            },
            {
                test: /\.(eot|svg|ttf|woff)$/,
                use: {
                    loader: 'file-loader',
                }
            },
            {
                test: /\.scss$/,  // scss处理loader顺序。从下往上。从右往左
                use: [
                    'style-loader', // 把css补充到head中
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 2,
                            // modules: true, // css模块化
                        }
                    }, // css处理各个css文件之间的关系
                    'sass-loader', // scss转化为css
                    'postcss-loader', // 补充浏览器厂商前缀
                ]
            },{
                test: /\.css$/,  // scss处理loader顺序。从下往上。从右往左
                use: [
                    'style-loader', // 把css补充到head中
                    'css-loader',
                    'postcss-loader',
                ]
            },
            // {
            //     test: /\.vue$/,
            //     use: {
            //         loader: 'vue-loader',
            //     }
            // },
        ]
    },  
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        }),
        new CleanWebpackPlugin(),
        // new webpack.HotModuleReplacementPlugin(),
    ],
    output: {
        // publicPath: 'www.baidu.com', // 打包出资源的路径前缀
        filename: '[name].js', // 打包出的文件名字
        path: path.resolve(__dirname, 'dist') // 打包出的文件夹名字（bundle）
    }
}