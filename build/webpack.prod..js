const merge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // css代码分割单独一个css文件
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin'); // css代码压缩

const prodConfig = {
    mode: 'production', // 打包环境。（默认production。bundle.js代码压缩成一行）
    devtool: 'cheap-module-source-map', // 是否开启source-map。module指的是对loader里面进行转换。
    module: {
        rules: [
            {
                test: /\.scss$/,  // scss处理loader顺序。从下往上。从右往左
                use: [
                    MiniCssExtractPlugin.loader, // css代码分割要用插件的loader
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
                    MiniCssExtractPlugin.loader, // css代码分割要用插件的loader
                    'css-loader',
                    'postcss-loader',
                ]
            }
        ]
    },
    optimization: {
        minimizer: [new OptimizeCSSAssetsPlugin({})],  // css代码压缩
    },
    plugins: [
        new MiniCssExtractPlugin({  // 被页面直接引用css文件会走filename。不是直接引用的走chunkFilename
            filename: '[name].css', 
            chunkFilename: '[name].chunk.css',
        }),
    ]
}

module.exports = merge(commonConfig, prodConfig); // 合并webpack配置相同部分