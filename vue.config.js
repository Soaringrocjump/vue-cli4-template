const path = require('path')//引入path模块
const CompressionPlugin = require('compression-webpack-plugin')//打包开启gzip

function resolve (dir) {
    return path.join(__dirname,dir)//path.join(__dirname)设置绝对路径
}
module.exports={
		lintOnSave: 'error', // 设置eslint报错时停止代码编译
	  productionSourceMap: false, // 不需要生产环境的 source map（减小dist文件大小，加速构建）
	  devServer: {
	    open: true,  // npm run serve后自动打开页面
	    host: '0.0.0.0',  // 匹配本机IP地址(默认是0.0.0.0)
	    port: '9527', // 开发服务器运行端口号
	    proxy: {
				'/api': {
					target: 'http://finance-company.newrongyi.com', // 代理接口地址
					//secure: false,  // 如果是https接口，需要配置这个参数
					changeOrigin: true, // 是否跨域
					//ws: true, // proxy websockets
					//pathRewrite方法重写url
					pathRewrite: {
						'^/api': ''   //需要rewrite的, 这里理解成以'/api'开头的接口地址，把/api代替target中的地址
					}
				}
	    }
	  },
    chainWebpack: (config) => {
				// 移除 prefetch 插件(针对生产环境首屏请求数进行优化)
				config.plugins.delete('prefetch')
				// 移除 preload 插件(针对生产环境首屏请求数进行优化)
				config.plugins.delete('preload')
				// 配置别名
        config.resolve.alias
				// set第一个参数：设置的别名，第二个参数：设置的路径
        .set('@',resolve('./src'))
        .set('@components',resolve('./src/components'))
        .set('@views',resolve('./src/views'))
        .set('@assets',resolve('./src/assets'))
        // 图片小于10k转为base64
				config.module
				.rule('images')
				.use('url-loader')
				.loader('url-loader')
				.tap(options => Object.assign(options, { limit: 10240 }))
    },
		// 配置打包 js、css文件为.gz格式，优化加载速度
		configureWebpack: config => {
			if (process.env.NODE_ENV === 'production') {
				return {
					plugins: [new CompressionPlugin({
						test: /\.js$|\.css/, // 匹配文件
						threshold: 10240, // 超过10kB的数据进行压缩
						deleteOriginalAssets: false // 是否删除原文件 （原文件也建议发布到服务器以支持不兼容gzip的浏览器）
					})],
					performance: { // 生产环境构建代码文件超出以下配置大小会在命令行中显示警告
						hints: 'warning',
						// 入口起点的最大体积 整数类型（以字节为单位,默认值是：250000 (bytes)）
						maxEntrypointSize: 5000000,
						// 生成文件的最大体积 整数类型（以字节为单位,默认值是：250000 (bytes)）
						maxAssetSize: 3000000
						// // 只给出 js 文件的性能提示
						// assetFilter: function (assetFilename) {
						//   return assetFilename.endsWith('.js')
						// }
					}
				}
			}
		}
}