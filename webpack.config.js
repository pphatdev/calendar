const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    // mode: 'development', //development
    mode: 'production', //development
    entry: {
        jquery: path.resolve(__dirname, './src/asset/js/jquery.js'),
        app: path.resolve(__dirname, 'src/asset/js/index.js')
    },
    output: {
        path: path.resolve(__dirname, './dist/asset'),
        filename: 'js/[name].js',
        clean: true,
        assetModuleFilename: '[name][ext]'
    },
    devServer: {
        static: {
            directory: path.resolve(__dirname, 'dist')
        },
        port: 3000,
        open: true,
        hot: true,
        compress: true,
        historyApiFallback: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "Calendar",
            style: './asset/css/index.css',
            filename: 'index.html',
            template: 'src/index.html'
        })
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env'
                        ]
                    }
                }
            },
            {
                test:/\.(png|jpg|jpeg|gif|svg)$/i,
                type: 'asset/resource'
            },
            // {
            //     test: /\.css$/i,
            //     include: path.resolve(__dirname, 'src'),
            //     use: ['style-loader', 'css-loader', 'postcss-loader'],
            // },

        ],
    }
}