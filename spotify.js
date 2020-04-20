/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

 var SpotifyWebApi = require('spotify-web-api-node');

module.exports.Spotifyy = class {
 // credentials are optional
 constructor(){
 this.spotifyApi = new SpotifyWebApi({
   clientId: 'd1918e6d018b4ec3bb0f638d2d88825d',
   clientSecret: '2423f57f56a14c81b876ef6adbed95d2',
   redirectUri: 'https://example.com/callback'
 });
 this.spotifyApi.setAccessToken('BQBGRWg5Uk4l6GWlLwZ9Or6ObU08rkpdgCHsO5cl7pi2qVA3WajCKTMKHkn7eU3SKhCB_QFqV1ELKw7ANi48Uu_Xl_JPWXGqW_vXjp5rr9ALefy6dbieq-iqGyoR9mBzMstdz2ofiszmO271YMGMmSPHMIcQrJvQUQQ1BQ');

}
 //console.log(access_token);

 togglePlay() {

   var isPlaying = false;

   spotifyApi.getMyCurrentPlaybackState({
     }).then(function(data) {
       console.log(data.body);
       data.body['is_playing'] == null || data.body['is_playing'] == false ? spotifyApi.play() : spotifyApi.pause();
     }, function(err) {
       console.log('Something went wrong!', err);
     });
 }

 skip() {
   spotifyApi.skipToNext();
 }

 playPrev() {
   spotifyApi.skipToPrevious();
 }

 shuffle() {
   spotifyApi.setShuffle()

 }
}

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var fs = require('fs');
var opn = require('open');

var client_id = 'd1918e6d018b4ec3bb0f638d2d88825d'; // Your client id
var client_secret = '2423f57f56a14c81b876ef6adbed95d2'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

global.access_token = '';

var app = express();

app.use(express.static(__dirname))
   .use(cors())
   .use(cookieParser());

app.use('/public', express.static(__dirname + '/public'));

app.use(express.static(__dirname + 'node_modules'));

 app.get('/', function(req, res) {
     res.render('index.html');
 });

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-modify-playback-state user-read-playback-state';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;
  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;
        global.access_token = body.access_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
        //saveTokenAsFile();
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});






console.log('Listening on 8888');
app.listen(8888);
//opn('http://localhost:8888/login')
