const path = require('path')
const debug = process.env.NODE_ENV !== 'production'
const glob = require('glob')
const CopyWebpackPlugin = require('copy-webpack-plugin')

function getEntry (globPath) {
  let entries = {}
  glob.sync(globPath).forEach(function (entry) {
    var basename = path.basename(entry, path.extname(entry))
    var temp = entry.replace(/\.js/, '.html')
    entries[basename] = {
      entry: entry,
      template: temp
    }
  })
  return entries
}

function resolve (dir) {
  return path.join(__dirname, '.', dir)
}

function assetsPath (_path) {
  return path.posix.join('static', _path)
}

const htmls = getEntry('./src/pages/**/*.js')

module.exports = {
  publicPath: './',
  outputDir: 'dist',
  assetsDir: 'static',
  pages: htmls,
  configureWebpack: {
    devtool: debug ? '#source-map' : '',
    output: {
      filename: assetsPath('js/[name].[hash].js'),
      chunkFilename: assetsPath('js/[id].[hash].js')
    },
    resolve: {
      extensions: ['.js', '.vue', '.json'],
      alias: {
        '@': resolve('src'),
        '@c': resolve('src/components'),
        'vue$': 'vue/dist/vue.esm.js'
      }
    },
    plugins: [
      new CopyWebpackPlugin([
        {
          from: path.resolve(__dirname, './static'),
          to: 'static',
          ignore: ['.*']
        }
      ])
    ]
  },
  chainWebpack: config => {
    config.module
      .rule('image-webpack-loader')
      .test(/\.(gif|png|jpe?g|svg)$/i)
      .use('file-loader')
      .loader('image-webpack-loader')
      .tap(() => ({
        disable: debug
      }))
      .end()
  },
  css: {
    extract: {
      filename: 'css/[name].[contenthash].css',
      chunkFilename: 'css/[id].[contenthash].css'
    },
    sourceMap: true, // 是否在构建样式地图，false将提高构建速度
  },
  parallel: require('os').cpus().length > 1,
  devServer: {
    open: true,
    host: 'localhost',
    port: 3000,
    https: false,
    hotOnly: false,
    proxy: {
      '/api': {
        // target: 'http://example.com',
        changeOrigin: true
      }
    },
    before: app => {}
  },
  pluginOptions: {

  }
}
