const merge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');

const prodConfig = {
    mode: 'production', // 打包环境。（默认production。bundle.js代码压缩成一行）
    devtool: 'cheap-module-source-map', // 是否开启source-map。module指的是对loader里面进行转换。
}

module.exports = merge(commonConfig, prodConfig); // 合并webpack配置相同部分