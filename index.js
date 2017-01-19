var fs = require('fs')
var https = require('https')
var http = require('http')
var ecstatic = require('ecstatic')(__dirname)
var ytdl = require('ytdl-core')
var request = require('request')

var router = require('routes')()
router.addRoute('/audio/:url', getAudioStreamFromUrl)

function getAudioStreamFromUrl (req, res, params) {
  ytdl(params.url, { 'filter': 'audioonly' })
    .pipe(res)
}

// https server options
var options = {
  // key: fs.readFileSync('key.pem'),
  // cert: fs.readFileSync('cert.pem')
}

http.createServer(function (req, res) {
  console.error(req.url, 'STARTED')
  res.on('finish', function() {
    console.error(req.url, 'DONE  ' + res.statusCode)
  })

  var route = router.match(req.url)
  if (route) {
    route.fn(req, res, route.params)
  } else {
    ecstatic(req, res)
  }
}).listen(4000)
