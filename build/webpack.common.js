const path = require('path'); // node包
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 打包之后的dist文件夹下生成html文件
const CleanWebpackPlugin = require('clean-webpack-plugin');// 每次打包之前清空dist文件夹。生成新的dist文件
const webpack = require('webpack');

module.exports = {
    entry: {
        main: './src/index.js', // 入口文件
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
        ]
    },  
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.html' // 以这个html为模板生成dist文件下的html
        }),
        new CleanWebpackPlugin(),     // 每次重新打包都会清空dist文件夹下的内容
        // new webpack.HotModuleReplacementPlugin(),
        new webpack.ProvidePlugin({
            $: 'jquery',  // 当发现模块当中$字符串的时候。webpack自动把jquery引入
            _: 'lodash',
        })
    ],
    optimization: {      // 代码分割
        usedExports: true, // tree shaking对所有的模块代码都tree shaking。在packjson里的sideEffets可以进行配置修改。
        splitChunks: {
            chunks: 'all',
        }
    },
    output: {
        // publicPath: 'www.baidu.com', // 打包出资源的路径前缀
        filename: '[name].js', // 打包出的文件名字
        chunkFilename: '[name].chunk.js',
        path: path.resolve(__dirname, '../dist') // 打包之后的文件路径（../dist是因为我package.json什么用某配置文件打包之后。dist文件夹在build文件夹下生成。与配置文件同级）
    }
}