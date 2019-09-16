var utils = require('./utils')
var webpack = require('webpack')
var config = require('../config')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

// add hot-reload related code to entry chunks
Object.keys(baseWebpackConfig.entry).forEach(function (name) {
  baseWebpackConfig.entry[name] = ['./build/dev-client'].concat(baseWebpackConfig.entry[name])
})

var webpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: '#cheap-module-eval-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': config.dev.env,
      'DEPLOY_ENV': JSON.stringify(process.env.DEPLOY_ENV)
    }),
    // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true,
      chunks: ['app']
    }),
    new FriendlyErrorsPlugin()
  ]
})

// 多入口配置

// 默认入口
var pages = utils.getEntries('./src/pages/**/*.html')
var entries = utils.getEntries('./src/pages/**/*.js')

var index = process.argv.indexOf('--')
var type = process.argv[index + 1]
var pageList = process.argv.slice(index + 2)
var reg = pageList[0]

for (var i = 1; i < pageList.length; i++) {
  reg += `|${pageList[i]}`
}
// 传参指定入口
if (index !== -1 && pageList.length > 0) {
  if (type === 'directory') {
    pages = utils.getEntries(`./src/pages/?(${reg})/*.html`)
    entries = utils.getEntries(`./src/pages/?(${reg})/*.js`)
  } else if (type === 'file') {
    pages = utils.getEntries(`./src/pages/**/?(${reg}).html`)
    entries = utils.getEntries(`./src/pages/**/?(${reg}).js`)
  }
}

for (var name in pages) {
  webpackConfig.plugins.push(
    new HtmlWebpackPlugin({
      filename: name + '.html',
      template: pages[name],
      chunks: entries[name] ? [name] : [],
      inject: true
    })
  )
}

module.exports = webpackConfig
