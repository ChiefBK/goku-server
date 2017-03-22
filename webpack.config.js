var webpack = require('webpack');

module.exports = {
    entry: [
        // 'webpack-dev-server/client?http://' + require("os").hostname() + ':8080/',
        // 'webpack/hot/only-dev-server',
        './index.js'
    ],
    module: {
        loaders: [],
    },
    resolve: {
        extensions: ['*', '.js', '.jsx']
    },
    output: {
        path: __dirname + '/dist',
        filename: 'bundle.js'
    },
    node: {
        fs: "empty",
        net: 'empty',
        tls: 'empty'
    },
    plugins: [],
    externals: ['fs','ws'],
    target: "node"
};