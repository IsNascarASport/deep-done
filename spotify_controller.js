var SpotifyWebApi = require('spotify-web-api-node');
var fs = require('fs');
const request = require('request');
var opn = require('open');

// credentials are optional
var spotifyApi = new SpotifyWebApi({
  clientId: 'd1918e6d018b4ec3bb0f638d2d88825d',
  clientSecret: '2423f57f56a14c81b876ef6adbed95d2',
  redirectUri: 'https://example.com/callback'
});

var access_token = fs.readFileSync('Access_Token.txt', 'utf8');

//console.log(access_token);
spotifyApi.setAccessToken(access_token);

function togglePlay() {

  var isPlaying = false;

  spotifyApi.getMyCurrentPlaybackState({
    }).then(function(data) {
      console.log(data.body);
      data.body['is_playing'] == null || data.body['is_playing'] == false ? spotifyApi.play() : spotifyApi.pause();
    }, function(err) {
      console.log('Something went wrong!', err);
    });
}

function skip() {
  spotifyApi.skipToNext();
}

function playPrev() {
  spotifyApi.skipToPrevious();
}

function shuffle() {
  spotifyApi.setShuffle()

}
