import queryString from 'querystring'
// 自己封装的 body-parser
export default function(req, res, next) {
  // 为了更加严谨一些，不让 get 请求进来，我们可以加一些判断（req.headers 可以拿到当前请求的请求头报文信息）
  // 请求头里面，如果是 post 请求是有 content-length 属性的，它的长度就是查询字符串的长度，中文就不算了，中文可能会乱码，比如 foo: bar 就是七个字符：foo=bar， 而 get 请求是没有的（因为它的方式和 post 不一样）
  console.log('进入到body-parser了')
  // console.log(req.headers)
  // console.log(req.method)
  // 这个判断使用 req.method 和  req.headers['content-length'] 都可以判断请求方法是什么

  // 如果是 get 请求，那么就不让走这个中间件进行处理
  if (req.method.toLowerCase() == 'get') {  // 如果属性是带 横杠的 那么要这样获取
    // 这就表明不是 post 请求，直接放行，不解析
    // 这里要 return，不然会报错的，比如是get 请求进来，next 下一个中间件，而没有写 return 下面的代码的 next 也会执行
    // 也就是请求一次调了两次中间件，那么那个中间件要是有 res.send，那就是响应了两次（所以，客户端请求一次，服务端是不能给出两次或多次响应的）
    return next()
  }
  // 如果是普通表单的 POST，则咱们自己处理：application/x-www-form-urlencoded
  // 如果是有文件的表单POST，则咱们不处理：multipart/form-data
  // 所以通过判断 请求头的 content-type 来判断是否走这个中间件
  // 如果是 application/x-www-form-urlencoded，就说明没传递文件，所以走这个中间件
  // 如果是 multipart/form-data，就说明传递了文件，那么就不走这个中间件了，让 formidable 这个包来处理
  console.log(req.headers)
  // 因为带文件上传的 content-type 有两条数据：'multipart/form-data; boundary=----WebKitFormBoundaryqOwex8P5AKXVpcxn'， 所以我们可以通过 split 转换数组来取第一项
  // 而不带文件上传的虽然只有一条数据：'application/x-www-form-urlencoded'，通过 split 转换之后默认拿到的也是第一项 ：application/x-www-form-urlencoded
  // const contentType = req.headers['content-type'].split(',')[0]

  // startsWith: 如果当前字符串中，是以某个字符串开头的就返回 true
  if (req.headers['content-type'].startsWith('multipart/form-data')) {
    // 这样就不处理，交给下一个用 formidable 的中间件来处理
    return next()
  }

  // if (contentType)


  // 由于表单 POST 请求可能会携带大量的数据，所以在进行请求提交的时候会分为多次提交
  //     // 具体分为多少次进行提交不一定，取决于数据量的大小
  //     // 在 Node 中，对于处理这种不确定的数据，使用事件的形式处理
  //     // 这里可以通过监听 req 对象的 data 事件，然后 通过对应的回调处理函数中的参数 chunk 拿到每一次接收到的数据
  //     //    data 事件触发多少次不一定
  //     // 当数据接收完毕之后，会自动触发 req 对象的 end 事件，然后就可以在 end 事件中使用接收到的表单 POST 请求体
  let data = ''
  req.on('data', chunk => {   // chunk 就是数据块
    // chunk 是二进制，和字符串拼接就会自动 toString()
    data += chunk
  })
  req.on('end', () => {
    // 由于接收的是一个用 & 符号拼接的字符串：foo=bar&a=b 我们如果想转成对象还得通过 & 符号来 split 转成数组，然后循环，生成 key， value 的形式
    // 这太麻烦了，还好 Node 有一个内置的模块：querystring （通过 querystring 就可以把查询参数转成一个对象，当然这个模块需要导入的）
    req.body = queryString.parse(data)
    // 手动给 req 对象挂载一个 body 属性，值就是当前表单 POST 请求体对象
    // 在后续的处理中间件中就可以 直接使用 req.body 了
    // 因为在同一个请求中，流通的都是同一个 req 和 res 对象（所以这个走完，下一个 advert 的还是同样的，所以能拿到）
    // 比如请求路径刚好是 advert ，然后会先走这个中间件，在这里我们把数据解析完挂载到了 req.body 属性上，然后调用了next()，所以下一个 /advert 中间件，直接拿来用就可以了
    next()
  })
}
