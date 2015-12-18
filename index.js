var http = require('http')
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
      res.end(err)
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
      res.end(targetUrl)
    } else {
      res.statusCode = 404
      res.end()
    }
  })
}

http.createServer(function (req, res) {
  var route = router.match(req.url)
  if (route) {
    route.fn(req, res, route.params)
  } else {
    ecstatic(req, res)
    console.log(req.url, 'STARTED')
    res.on('finish', function() {
      console.log(req.url, 'DONE')
    })
  }
}).listen(4000)
