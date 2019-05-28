const webpack = require('webpack');
const merge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');

const devConfig = {
    mode: 'development', // 打包环境。（默认production。bundle.js代码压缩成一行）
    devtool: 'cheap-module-eval-source-map', // 是否开启source-map。module指的是对loader里面进行转换。
    devServer: { 
        contentBase: './dist',
        open: true,
        port: 8181,
        hot: true,  // 热更新模块（css|js文件不会重新请求locahost导致刷新页面）、且热加载的文件不会被打包到dist文件夹。而是放在内存中。
        // hotOnly: true, // 不支持更新，或者热更新失败不会刷新页面
    },
    plugins: [
        // new webpack.HotModuleReplacementPlugin(),
    ],
    optimization: {
        usedExports: true,
    },
}

module.exports = merge(commonConfig, devConfig); // 合并webpack配置相同部分