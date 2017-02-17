/**
 * Created by jorten on 16/3/16.
 */
var webpack = require('webpack');
var path = require('path');
var nodeModulesPath = path.resolve(__dirname, 'node_modules');
var buildPath = path.resolve(__dirname, 'public', 'build');
var mainPath = path.resolve(__dirname, 'app', 'main.js');

var config = {
    // Makes sure errors in console map to the correct file
    // and line number
    devtool: 'eval',
    entry: [
        mainPath,

        // For hot style updates
        'webpack/hot/dev-server',

        // The script refreshing the browser on none hot updates
        'webpack-dev-server/client?http://localhost:8080'

        //mainPath,
        //{
        //    vendor: ['jquery']
        //}
],

    output: {
        path: buildPath,
        filename: 'bundle.js',
        publicPath: '/build/'
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: [nodeModulesPath], loader: 'babel-loader?presets[]=es2015&presets[]=react' },
            {
                test: /\.less$/,
                loader: "style!css!less"
            },
            { test: /\.css$/, loader: "style!css" },
            {
                test: /\.(jpe?g|png|gif|svg)$/ig,
                loaders: [
                    'file?hash=sha512&digest=hex&name=[hash].[ext]',
                    'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
                ]
            },
            { test: /\.(woff|svg|eot|ttf)\??.*$/, loader: 'url-loader?limit=50000&name=[path][name].[ext]'}
        ]
    },
    //plugins: [//new webpack.optimize.CommonsChunkPlugin('core', 'core.js'),
    //    new webpack.optimize.UglifyJsPlugin({
    //        compress: {
    //            warnings: false
    //        }
    //    })]
    //热加载插件
    plugins: [new webpack.HotModuleReplacementPlugin()]
    //压缩JS 插件
    //plugins: [
    //    new Webpack.optimize.MinChunkSizePlugin(1024)
    //]
};
module.exports = config;