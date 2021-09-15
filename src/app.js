import express from 'express'
import config from './config'
import nunjucks from 'nunjucks'
import indexRouter from './routes/index'
import advertRouter from './routes/advert'
import queryString from 'querystring'
import bodyParser from './middlewares/body-parser'
import errLog from './middlewares/error-log'

const app = express()

// 暴露 node_modules 静态资源，第一个参数为请求前缀（这里我们请求的就是 node_modules），第二个参数是 调用express.static方法，方法里面传递第一个参数的绝对路径
app.use('/node_modules', express.static(config.node_modules_path))
// 暴露 public 静态资源
app.use('/public', express.static(config.public_path))

// 配置使用 nunjucks 模板引擎
// nunjucks 模板引擎没有对模板文件名的后缀名做特定限制
// 如果文件名是 a.html 则渲染的时候就需要传递 a.html
// 如果文件名是 b.nujs 则传递 b.nujs
nunjucks.configure(config.viewPath, {
    autoescape: true,
    express: app,
    // 默认是 false 不使用缓存，那么就会每次我们修改都需要重新编译，但是如果改成 true，每次我们修改模板文件就可以做到实时编译了
    noCache: true
});

// 挂载解析表单 POST 请求体中间件
app.use(bodyParser)

// 挂载路由容器，（路由容器中组织了网站功能处理路由中间件）
app.use(indexRouter)
app.use(advertRouter)

// 全局错误处理中间件，这个要放到所有路由的后面，以便于能接收到 错误对象
app.use(errLog)

app.listen(3000, () => {
    console.log('server is running at port 3000...');
})

