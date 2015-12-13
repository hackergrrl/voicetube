var search = require('youtube-search')
var ytdl = require('ytdl-core')
var ytApiKey = require('./yt_api_key')

var log = function (txt) {
  var stdout = document.getElementById('stdout')
  stdout.innerHTML += txt + '\n'

  console.log(txt)
}
if (!('webkitSpeechRecognition' in window)) {
  log('no speech api support')
} else {
  log('begin')
  var recognition = new webkitSpeechRecognition()
  recognition.continuous = true
  recognition.interimResults = true

  recognition.onstart = function () {
    log('start')
  }
  recognition.onresult = function (event) {
    var result = event.results[event.results.length - 1]
    if (result.isFinal) {
      recognition.stop()
      var alt = result[result.length - 1]
      // console.log(alt)
      result = alt.transcript.trim()
      log(result)
      search(result, {maxResults: 3, key: ytApiKey}, function (err, videos) {
        if (err) {
          console.error(err)
        } else {
          videos = videos.filter(function (video) {
            return (video.kind === 'youtube#video')
          })

          var link = videos[0].link
          var encodedUrl = encodeURIComponent(link)

          var audio = document.createElement('audio')
          audio.src = '/audio/' + encodedUrl
          audio.autoplay = true
          audio.controls = true
          document.body.appendChild(audio)
        }
      })
    }
  }
  recognition.onerror = function (err) {
    log('err')
    log(err.toString())
    console.error(err)
  }
  recognition.onend = function () {
    log('end')
  }

  recognition.lang = 'en-US'
  // recognition.lang = 'de'
  recognition.start()
}
