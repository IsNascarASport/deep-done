var className = "";
var prob = 0;
var bgImageData;
var dim = 240;

document.addEventListener('DOMContentLoaded', function () {
    var player = document.getElementById('player');
    var canvas = document.getElementById('c');
    var context = canvas.getContext('2d');

    var handleSuccess = function (stream) {
        player.srcObject = stream;
    };


    navigator.mediaDevices.getUserMedia({ video: true })
        .then(handleSuccess)

    var cw = Math.floor(canvas.clientWidth / 10);
    var ch = Math.floor(canvas.clientHeight / 10);
    canvas.width = cw;
    canvas.height = ch;

    player.addEventListener('play', function () {

        //captureBackground();
        //draw(this, context, dim, dim);
    }, false);



}, false);

// Takes the webcam image and compresses it to 224x224, then predicts what the image is.
async function draw(v, c, w, h) {
    if (v.paused || v.ended) return false;
    c.drawImage(v, 0, 0, w, h);

    // Gets the image from the webcam and converts it to an input for the tensorflow model
    let frame = c.getImageData(0, 0, w, h);

    // subtract the background
    // for (let i=0; i<frame.length; i++) {
    //     frame.data[i] -= bgImageData.data[i];
    //     console.log("For loop");
    // }

    let img = tf.browser.fromPixels(frame).resizeNearestNeighbor([dim,dim]).toFloat();

    let scale = tf.scalar(255.0)
    // Load model and predict what img is
    const model = await tf.loadLayersModel('http://localhost:8888/models/model.json');
    let img_reshape = img.reshape([-1, dim, dim, 3]);
    const pre = await model.predict(img_reshape.div(scale).sub(bgImageData)).argMax([-1]).print();
    const prediction = await model.predict(img_reshape.div(scale).sub(bgImageData)).argMax([-1]);
    data = null;
    prediction.array().then(array => fixArray(array));



    // // Takes the probability from the prediction and converts it to percentage
    // prob = prediction[0]["probability"];
    // prob = Math.floor(prob * 100);

    // // Takes the top class name from prediction
    // className = prediction[0]["className"];
    // document.getElementById("prediction").textContent = className + " with probability of " + prob + "%";

    // Displays the image that is being input to the model on the top left of the screen
    c.putImageData(frame, 0, 0);



    // Calls the function again after certain amount of time (in ms)
    setTimeout(draw, 400, v, c, w, h);
}

function capture() {
    var player = document.getElementById('player');
    var canvas = document.getElementById('c');
    var context = canvas.getContext('2d');
    player.play();
    var timeleft = 4;
    var preds = [];
    var probs = [];
    document.getElementById("countdown").textContent = "Get Ready";
    var captureFrames = setInterval(function () {
        captureBackground();
        timeleft--;

        if (timeleft == 0) {
            document.getElementById("countdown").textContent = "Finished";
            console.log(preds);

            draw(player, context, 240, 240);
            player.pause();
        }
        else {
            document.getElementById("countdown").textContent = "Capturing " + timeleft;
            preds.push(className);
            probs.push(prob);



        }



        if (timeleft <= -1)
            //console.log(preds);
            clearInterval(captureFrames);
    }, 600);



}


function fixArray(a) {
  data = a[0];
      if (data == 0){
        console.log("Left");
        play()
      }
      if (data == 1){
        console.log("Top");
        next();
      }
      if (data == 2){
        console.log("Right")
        pause();
      }
      if (data == 3){
        console.log("Bottom")
        prev();
      }
}


function pause() {

  var params = getHashParams();


  var access_token = params.access_token, refresh_token = params.refresh_token, error = params.error;
  $.ajax({
            url: 'https://api.spotify.com/v1/me/player/pause',
            type: "PUT",
            headers: {
              'Authorization': 'Bearer ' + access_token
            },
            success: function(response) {
              //console.log("success")
            }
        });
}



function play() {

  var params = getHashParams();


  var access_token = params.access_token, refresh_token = params.refresh_token, error = params.error;
  $.ajax({
            url: 'https://api.spotify.com/v1/me/player/play',
            type: "PUT",
            headers: {
              'Authorization': 'Bearer ' + access_token
            },
            success: function(response) {
              //console.log("success")
            }
        });
}

function next() {

  var params = getHashParams();


  var access_token = params.access_token, refresh_token = params.refresh_token, error = params.error;
  $.ajax({
            url: 'https://api.spotify.com/v1/me/player/next',
            type: "POST",
            headers: {
              'Authorization': 'Bearer ' + access_token
            },
            success: function(response) {
              //console.log("success")
            }
        });
}

function prev() {

  var params = getHashParams();


  var access_token = params.access_token, refresh_token = params.refresh_token, error = params.error;
  $.ajax({
            url: 'https://api.spotify.com/v1/me/player/previous',
            type: "POST",
            headers: {
              'Authorization': 'Bearer ' + access_token
            },
            success: function(response) {
            //  console.log("success")
            }
        });
}

// Sets the bgImageData variable
function captureBackground() {
    var player = document.getElementById('player');
    var canvas = document.getElementById('c');
    var context = canvas.getContext('2d');


    // Gets the image from the webcam and converts it to an input for the tensorflow model
    let framee = context.getImageData(0, 0, 240, 240);
    let ff = tf.scalar(255.0);
    context.drawImage(player, 0, 0, 240, 240);
    bgImageData = tf.browser.fromPixels(framee).resizeNearestNeighbor([dim,dim]).toFloat().div(ff);

    //play();




}
