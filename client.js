var search = require('youtube-search')
var request = require('browser-request')

var ytApiKey = require('./yt_api_key')

var firstLoad = true

var log = function (txt) {
  var stdout = document.getElementById('stdout')
  if (stdout) {
    stdout.innerHTML += txt + '\n'
  }

  console.log(txt)
}

function showInfo(info) {
  document.getElementById('info').innerHTML = info
}

function showIcon(name) {
  document.getElementById('icon_listen').style.display = 'none'
  document.getElementById('icon_pause').style.display = 'none'
  document.getElementById('icon_play').style.display = 'none'
  document.getElementById('icon_stop').style.display = 'none'
  document.getElementById('icon_listening').style.display = 'none'
  document.getElementById('icon_listen').style.display = 'none'
  document.getElementById('icon_working').style.display = 'none'
  document.getElementById('icon_error').style.display = 'none'

  document.getElementById('icon_' + name).style.display = 'inline-block'

  return document.getElementById('icon_' + name)
}

function startListening() {
  if (firstLoad) {
    var audio = document.getElementById('playback')
    audio.load()
    firstLoad = false
  }

  var state = 'pre'

  if (!('webkitSpeechRecognition' in window)) {
    log('no speech api support')
  } else {
    log('begin')
    showIcon('working')
    showInfo('')
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
      state = 'working'
      showInfo('processing speech')
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

          videoSearch(result, function (err, title, link) {
            if (err) {
              console.error(err)
              showIcon('error')
              showInfo('YouTube error: ' + err)
            } else {
              showInfo('')

              document.getElementById('title').innerHTML = title

              showInfo('downloading')

              showInfo('preparing to play')

              playUrlAudio(link, function onPlay () {
                showIcon('stop')
              }, function onEnd () {
                endPlayback()
              })

              // TODO: do we actually need this?
              setTimeout(function() {
                audio.play()
                showInfo('')
              }, 3000)
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
      if (state !== 'working') {
        endPlayback()
      }
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

function videoSearch (text, done) {
  search(text, {maxResults: 3, key: ytApiKey}, function (err, videos) {
    if (err) return done(err)

    videos = videos.filter(function (video) {
      return (video.kind === 'youtube#video')
    })

    done(null, videos[0].title, videos[0].link)
  })
}

function playUrlAudio (url, onPlay, onEnd) {
  var encodedUrl = encodeURIComponent(url)
  var audio = document.getElementById('playback')
  audio.src = '/audio/' + encodedUrl

  audio.addEventListener('ended', onEnd)
  audio.addEventListener('playing', onPlay)
}
