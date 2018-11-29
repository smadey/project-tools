const InlineSourcePlugin = require('html-webpack-inline-source-plugin')
const FilterChunkPlugin = require('filter-chunk-webpack-plugin')

module.exports = {
  // filenameHashing: false,
  productionSourceMap: false,
  chainWebpack: (config) => {
    if (process.env.NODE_ENV === 'production') {
      config
        // .optimization
        //   .splitChunks(false)
        .plugin('html')
          .tap(args => args.map(arg => Object.assign(arg, { inlineSource: '.(js|css)$' })))
          .end()
        .plugin('inline-resource')
          .use(InlineSourcePlugin)
          .end()
        .plugin('filter-chunk')
          .use(FilterChunkPlugin, [{ patterns: ['**/*.js', '**/*.css'] }])
          .end()
        .plugins
          .delete('preload')
          .delete('prefetch')
    }
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        asar: false,
      }
    }
  }
}
