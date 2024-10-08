let http = require('http');
let SECRET = '123456'
let crypto = require('crypto')
let { spawn } = require('child_process')
function sign(body) {
  return `sha1=` + crypto.createHmac('sha1', SECRET).update(body).digest('hex')
}
let server = http.createServer(function (req, res) {
  console.log(req.method, req.url);
  if (req.method == 'POST' && req.url == '/webhook') {
    let buffers = []
    req.on('data', function (buffer) {
      buffers.push(buffer)
    })
    req.on('end', function (buffer) {
      let body = Buffer.concat(buffers)
      let event = req.headers['x-github-event']; // event=push
      console.log(event);
      // github 请求来的时候， 要传递请求体body，另外还会传一个signature过来，需要验证签名对不对
      let signature = req.headers['x-hub-signature']
      if (signature !== sign(body)) {
        return res.end('Not Allowed')
      }
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: true }))
      if (event == 'push') {  //开始部署
        let payload = JSON.parse(body);
        let child = spawn('sh', [`./${payload.repository.name}.sh`])
        let buffers = [];
        child.stdout.on('data', function (buffer) {
          buffers.push(buffer)
        })
        child.stdout.on('end', function (buffer) {
          let log = Buffer.concat(buffers)
          console.log(log);
        })
      }
    })
  } else {
    res.end('Not Found')
  }
})

server.listen(4000, () => {
  console.log('webhook服务已经在4000端口上启动');
})