var search = require('youtube-search')
var ytdl = require('ytdl-core')
var ytApiKey = require('./yt_api_key')
var request = require('browser-request')

var log = function (txt) {
  var stdout = document.getElementById('stdout')
  stdout.innerHTML += txt + '\n'

  console.log(txt)
}

function startListening() {
  if (!('webkitSpeechRecognition' in window)) {
    log('no speech api support')
  } else {
    log('begin')

    document.getElementById('listen').disabled = true
      
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

            request.get('/audio/' + encodedUrl, function (err, res, body) {
              if (err) {
                console.error(err)
                return
              }
              var audio = document.getElementById('playback')
              audio.src = body
              document.getElementById('stop').disabled = false
            })
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
}

function endPlayback() {
  var playback = document.getElementById('playback')
  playback.pause()
  playback.currentTime = 0
  document.getElementById('listen').disabled = false
  document.getElementById('stop').disabled = true
}

var listen = document.getElementById('listen')
listen.onclick = startListening

var stop = document.getElementById('stop')
stop.onclick = endPlayback
