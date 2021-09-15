// 广告管理模型数据

// 导入 mongoose
import mongoose from 'mongoose'

// 连接数据库
mongoose.connect('mongodb://localhost:27017/edu')

// 创建架构
const advertSchema = mongoose.Schema({
  // 图片标题
  title: { type: String, required: true },
  // 图片路径, 必须是字符串，并且还是必填项
  image: { type: String, required: true },
  // 图片链接
  link: { type: String, required: true },
  // 开始时间
  start_time: { type: Date, required: true },
  // 结束时间
  end_time: { type: Date, required:true },
  // 创建时间，Date.now() 没有加括号就是因为怕一上来就调用，这样就不是动态的了，因为我们不像创建架构就调用，而是添加到数据库的时候就生成这个默认时间
  create_time: { type: Date, default: Date.now },
  // 最后一次修改时间
  last_modified: { type: Date, default: Date.now }
})

// 发布导出模型，在路由中引入使用
const Advert = mongoose.model('Advert', advertSchema)
export default Advert

// 一个参数就不是创建模型了，就是获取了 （获取已经创建的模型）
// 例如我要查看 第一页，并且当前页的条数为3 （pageSize：3）
// 第一页，skip: 0,limit: 3
// 第二页：skip: 3,limit: 3   // 第二页就是跳过前三条，显示第四条（并且通过 limit 限制的显示的条数）
// 第三页：skip: 6,limit: 3
// 第n页 ：(n - 1) * 3     3是限制的条数，固定的



// Advert
//   // 如果有查询条件就在 find 里面写
//   .find()
//   .skip(3)
//   // 限制获取数据条数，默认从第一条开始（从 0 开始）
//   .limit(3)
//   .exec((err, result) => {
//     if (err) {
//       throw err
//     }
//     console.log(result)
//   })
