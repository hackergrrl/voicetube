# Woah woah woah
This is still in pre-release development. Don't expect things to work.


## What is this?
Voice-controlled music powered by YouTube. Say the name of a song, and poof, it
plays!

Web powered, built for mobile devices.

(insert demo url)

(insert screenshot here)


## Caveats

### chrome only

Only works on Chrome [at the moment](https://caniuse/...) across desktop,
Android, and iOS.

### https

The app gets served over HTTPS; otherwise Chrome presents more permission
dialogs to the user. This means you'll need to either generate/use your own
SSL keypair and certificate and pass them in as arguments, or let the app
generate a pair for you.

If you generate your own or let the app generate an SSL key and certificate,
you'll need to go through the rigamarole of telling Chrome "yes I'm sure this
site is not trying to steal my dog" on your first visit.


## Installation
```
$ npm install -g web-car-radio

$ web-car-radio
```

### generate key + cert

TODO: key/cert generation for https


## Usage

1. run `npm run build`
1. run `web-car-radio`
2. open a browser to https://localhost:4000
3. tap on the microphone icon
4. say the name of a song (e.g. "horse with no name")
5. enjoy the tunes


## The Future!

- fully hands-free (able to tell the playback to stop, or to play a new song)
- support different media backends (public domain music, vimeo, ...)
- [hyperboot](https://github.com/substack/hyperboot) support


## License
BSD
