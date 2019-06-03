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
        ]
    },  
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.html' // 以这个html为模板生成dist文件下的html
        }),
        new CleanWebpackPlugin(),     // 每次重新打包都会清空dist文件夹下的内容
        // new webpack.HotModuleReplacementPlugin(),
    ],
    optimization: {      // 代码分割
        splitChunks: {
            chunks: 'all',   // 无论同步还是异步都会进行代码分割。可以设置initial(同步)或者async(异步)
            minSize: 0,   // 对于分割出来的代码,如果文件大小 > minSize(30000字节约等于30kb)的时候才会在dist文件夹下生成新的分割文件
            // maxSize: 0,  // 对于分割出来的代码,如果文件大小 > maxSize的话。splitChunks会进行二次分割(了解)
            minChunks: 1,  // 对引用的模块的使用的至少几次的时候才分割
            maxAsyncRequests: 5, // 只分割前5个js文件,多出来的js文件不进行分割
            maxInitialRequests: 3, // 对入口文件,最多分割出3个js文件
            automaticNameDelimiter: '~', // 生成分割文件的连接符号
            name: true, // 可以使用name进行重命名
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,  // 是否从node_modules引入的模块(例如lodash)。在的话走vendors配置。不在的话走default配置
                    priority: -10,    // 优先级(越大优先级越高)
                    name: 'vendors.js', // 重命名
                },
                default: {
                    priority: -20,
                    reuseExistingChunk: true, // 如果一个模块被打包过了。那么再次打包的时候,不会被打包。会直接使用这个模块
                    name: 'common.js', // 重命名
                },
            }
        }
    },
    output: {
        // publicPath: 'www.baidu.com', // 打包出资源的路径前缀
        filename: '[name].js', // 打包出的文件名字
        path: path.resolve(__dirname, '../dist') // 打包之后的文件路径（../dist是因为我package.json什么用某配置文件打包之后。dist文件夹在build文件夹下生成。与配置文件同级）
    }
}