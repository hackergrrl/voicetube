var search = require('youtube-search')
var ytdl = require('ytdl-core')
var request = require('browser-request')

var ytApiKey = require('./yt_api_key')

var log = function (txt) {
  var stdout = document.getElementById('stdout')
  if (stdout) {
    stdout.innerHTML += txt + '\n'
  }

  console.log(txt)
}

function showIcon(name) {
  document.getElementById('icon_listen').style.display = 'none'
  document.getElementById('icon_pause').style.display = 'none'
  document.getElementById('icon_play').style.display = 'none'
  document.getElementById('icon_stop').style.display = 'none'
  document.getElementById('icon_listening').style.display = 'none'
  document.getElementById('icon_listen').style.display = 'none'
  document.getElementById('icon_working').style.display = 'none'

  document.getElementById('icon_' + name).style.display = 'inline-block'

  return document.getElementById('icon_' + name)
}

function startListening() {
  if (!('webkitSpeechRecognition' in window)) {
    log('no speech api support')
  } else {
    log('begin')
    showIcon('working')
    var done = false
    var recognition = new webkitSpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.onstart = function () {
      log('start')
      showIcon('listening')
    }
    recognition.onresult = function (event) {
      if (done) {
        return
      }
      // console.log(event)
      // log(event.results.length)
      // log(event.toString())
      for (var i = event.resultIndex; i < event.results.length; i++) {
        var result = event.results[i]
        if (result.isFinal) {
          recognition.stop()
          showIcon('working')
          done = true
          var alt = result[0]
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

              document.getElementById('title').innerHTML = videos[0].title

              request.get('/audio/' + encodedUrl, function (err, res, body) {
                if (err) {
                  console.error(err)
                  return
                }
                var audio = document.getElementById('playback')
                audio.src = body

                audio.addEventListener('ended', endPlayback)
                audio.addEventListener('playing', function () { showIcon('stop') })

                // TODO: do we actually need this?
                setTimeout(function() {
                  audio.play()
                }, 3000)
              })
            }
          })
        }
      }
    }
    recognition.onerror = function (err) {
      log('err')
      log(err.toString())
      console.error(err)
      showIcon('listen')
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
  showIcon('listen')
}


window.onload = function () {
  showIcon('listen')
  document.getElementById('icon_stop').onclick = endPlayback
  document.getElementById('icon_listen').onclick = startListening
}
