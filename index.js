var fs = require('fs')
var https = require('https')
var ecstatic = require('ecstatic')(__dirname)
var ytdl = require('ytdl-core')
var request = require('request')

var router = require('routes')()
router.addRoute('/audio/:url', getAudioStreamFromUrl)

function getAudioStreamFromUrl (req, res, params) {
  console.error('requesting info for', params.url)
  ytdl.getInfo(params.url, function (err, info) {
    if (err) {
      res.statusCode = 500
      res.end(err.toString())
      console.error(err.toString())
      return
    }
    console.error('got info')
    var lowestBitrate = 100000000
    var targetUrl = null
    info.formats.forEach(function(format) {
      if (/audio/.test(format.type)) {
        if (format.audioBitrate < lowestBitrate) {
          lowestBitrate = format.audioBitrate
          targetUrl = format.url
        }
      }
    })
    if (targetUrl) {
      console.error('found lowest bitrate audio')
      console.error(targetUrl)
      res.end(targetUrl)
    } else {
      res.statusCode = 404
      res.end()
    }
  })
}

// https server options
var options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
}

https.createServer(options, function (req, res) {
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
