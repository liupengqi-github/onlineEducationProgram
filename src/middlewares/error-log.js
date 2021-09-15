import mongodb from 'mongodb'
const MongoClient = mongodb.MongoClient
const url = 'mongodb://localhost:27017/edu'

export default (errLog, req, res, next) => {
  // 1. 将错误日志记录到数据库，方便排查错误
  // 将错误信息记录到数据库的集合中，结构：{ 错误名称： 错误信息： 错误堆栈： 错误发生时间 }
  // 2. 发送响应给用户，给一些友好的提示信息

  // 1.连接数据库
  MongoClient.connect(url, (err, db) => {
    db
      .collection('error_logs')
      .insertOne({
        name: errLog.name,
        message: errLog.message,
        stack: errLog.stack,
        time: new Date()
      }, (err, result) => {
        res.json({
          err_code: 500,
          message: errLog.message
        })
      })
  })
}
