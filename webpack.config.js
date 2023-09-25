const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development', //development
    // mode: 'production', //development
    entry: {
        jquery: [
            path.resolve(__dirname, './src/js/jquery.js'),
            './src/js/jquery.js'
        ],
        index: [
            path.resolve(__dirname, './src/js/index.js'), 
            './src/js/index.js'
        ],
        // calendar: [
        //     path.resolve(__dirname, './src/types/calendar.ts'), 
        //     './src/types/calendar.ts'
        // ],
    },
    output: {
        filename: '[name].js',
        // path: path.resolve(__dirname, './dist'),
        // filename: '[name]' + this.entry,
        clean: true,
        // assetModuleFilename: '[name][ext]'
    },
    resolve: {
        extensions: ['.ts', '.js'],
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
            style: './css/index.css',
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
            {
                test: /\.(tsx|ts|js|jsx)$/i,
                use: 'ts-loader',
                exclude: /node_modules/,
            },

        ],
    }
}