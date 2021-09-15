import { join } from 'path'

export default {
  // __dirname 指向的是 config.js 文件所在目录，所以我们还需要再 ../ 才能找到 views 目录（即使后来编译转换到 dist 文件夹，也是 ../views 来找到的 views 目录的）
  viewPath: join(__dirname, '../views'),
  node_modules_path: join(__dirname, '../node_modules'),
  public_path: join(__dirname, '../public'),
  uploadDir: join(__dirname, '../public/uploads')
}
