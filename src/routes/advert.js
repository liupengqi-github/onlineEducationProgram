import express from 'express'
import Advert from '../models/advert'
import formidable from 'formidable'
import config from '../config'
import { basename } from 'path'

// 创建一个路由容器，将所有的路由中间件挂载给路由容器
const router = express.Router()

// 渲染广告列表页
router.get('/advert', (req, res, next) => {
  // 接收分页参数
  console.log(req)
  // page 就是前台用户传递的当前页码，所以我们就可以拿到当前页码用来返回给前台做判断，如果我们点击的当前页码 正好 和 我们循环的 item 项对上了，那么就给它添加 active 类
  const page = req.query.page ? Number.parseInt(req.query.page, 10) : 1   // 参数 10 表示 十进制
  const pageSize = 5

  // 如果需要查询条件，指定第一个参数
  Advert
    // 先查数据，再查总记录数
    .find()
    // 这个 5 是咱们自己定义的，每页显示五条，所以是 5
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    // exec：执行前面的处理
    .exec((err, adverts) => {
      if (err) {
        return next(err)
      }
      Advert.count((err, count) => {
        if (err) {
          return next(count)
        }
        // 查询当前文档的总条数（在终端里查询的方式：db.adverts.count() ）
        // console.log(result)

        // 计算页码数（总页码  = 总记录数 / 每页显示大小）
        const totalPage =  Math.ceil(count / pageSize)
        res.render('advert_list.html', {
          adverts,
          // 传递总页数，是想通过服务端渲染直接生成页码
          totalPage,
          // 当前页码
          page
        })
      })

    })
})
// 渲染广告添加页
router.get('/advert/add', (req, res, next) => {
  res.render('advert_add.html')
})

/*
    添加广告
    POST /advert/add
    body: {
      title         // 标题
      image         // 图片url,
      link          // 链接
      start_time    // 开始时间： yyyy-MM-dd
      end_time      // 结束时间   yyyy-MM-dd
    }
*/
router.post('/advert/add', (req, res, next) => {
  // console.log('走到了这里')
  // 1. 接收表单提交的数据
  // const body = req.body
  // 改成使用 formidable 接收数据
  const form = new formidable.IncomingForm()
  // 配置 formidable 文件上传接收路径
  form.uploadDir = config.uploadDir
  // 配置保持文件原始的扩展名
  form.keepExtensions = true
  // fields 就是接收到的表单中的普通数据字段
  // files 就是表单中文件上传上来的一些文件信息，例如：文件大小、上传上来的文件路径
  form.parse(req, (err, fields, files) => { // fields 就是普通字段，也就是我们原来的 req.body
      if (err) {
        return next(err)
      }
      const body = fields
      // 通过 node.js 的 path 模块中，其中有一个 basename 方法，它就可以拿到 path 中的文件名（因为默认给我们返回的是绝对路径，我们拿到文件名之后，想给它变成相对路径）
      // 最后保存这个文件名就可以了
      body.image = basename(files.image.path)

      // 在这里把 files 中的图片处理一下
      // 就是在 body 中添加一个 image， 值就是图片上传上来的路径


      console.log(basename(files.image.path))

      // 2. mongoose 来操作数据库
      const advert = new Advert({
        // 传递前台的数据
        title: body.title,
        image: body.image,
        link: body.link,
        // 虽然前台在这里接收的方式是一个字符串，但是在存储的时候mongoose 觉得你传的也符合时间格式，就通过转化，转为日期对象了
        start_time: body.start_time,
        // 编码风格推荐： 在对象的最后一项放上一个逗号
        end_time: body.end_time
      })

      // 保存到数据库
      advert.save((err, result) => {
        if (err) {
          return next(err)
        }
        res.json({
          err_code: 0
        })
      })
  })
})

/*
    查询广告列表：
    GET  /advert/list
*/
router.get('/advert/list', (req, res, next) => {
  Advert.find((err, docs) => {
    if (err) {
      return next(err)
    }
    res.json({
      err_code: 0,
      result: docs
    })
  })
})

/*
    根据 ID 查询
    GET /advert/one/:id
*/

// advert/one/:advertId 是一个模糊匹配路径
// 可以匹配 /advert/one/*  任意的路径形式
// 例如：/advert/one/1   /advert/one/2    /advert/one/a    /advert/one/abc  等路径都是可以的
// 但是 /advert/one 或者 /advert/one/a/b 是不行的
// 至于 advertId 是自己起的一个名字，可以在处理函数中通过 req.params 来进行获取
router.get('/advert/one/:advertId', (req, res, next) => {
  // 只有我们这个模糊匹配的路由，也就是 :advertId 这个才能通过 req.params 接收到
  // res.end(`路径参数 ID 为 ${req.params.advertId}`)

  Advert.findById(req.params.advertId, (err, result) => {
    if (err) {
      return next(err)
    }
    res.json({
      err_code: 0,
      result: result
    })
  })
})

/*
    编辑
    POST /advert/edit
    id            修改id
    title         图片标题
    image         图片路径
    link          链接
    start_time    开始时间
    end_time      结束时间
*/
router.post('/advert/edit', (req, res, next) => {
  // 修改提交这里我们用的是 先通过 findById 通过前台传递的 id 查询出来，然后将查出来的数据修改，最后 save 保存到数据库
  Advert.findById(req.body.id, (err, advert) => {
    const body = req.body
    if (err) {
      return next(err)
    }
    advert.title = body.title
    advert.image = body.image
    advert.link = body.link
    advert.start_time = body.start_time
    advert.end_time = body.end_time
    // 最后一次修改时间
    advert.last_modified = Date.now()

    // 这里的 save 因为内部有一个 _id 所以这里是不会新增数据的，而是更新已有的数据
    advert.save((err, result) => {
      if (err) {
        return next(err)
      }
      res.json({
        err_code: 0
      })
    })
  })
})

router.get('/advert/remove/:advertId', (req, res, next) => {
  Advert.remove({ _id: req.params.advertId }, err => {
    if (err) {
      return next(err)
    }
    res.json({
      err_code: 0
    })
  })
})

export default router
