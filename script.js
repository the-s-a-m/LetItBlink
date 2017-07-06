//window.setInterval(colorChange, 100);

var canvas = null;
var body = null;
var ctx = null;
var audioContext = null;
var context = null;
var audioInput = null;
var analyser = null;
var bufferSize = 2048;
var recorder = null;
var soundArray =  null;
var maxMeasured = 50;
var relative = 1;

window.onload = function () {
    canvas = document.getElementById("canvas");
    body = document.body;
    ctx = canvas.getContext("2d");
    initializeMedia();
}

function initializeMedia() { 
    if (!navigator.getUserMedia)
        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || 
            navigator.msGetUserMedia;
    if (navigator.getUserMedia){
        navigator.getUserMedia({audio:true, video:false}, initializeRecorder, function(e) {
            console.log('Error capturing audio.');
            return;
        });
    } else {
        console.log('getUserMedia not supported in this browser.');
        return;
    }
}

function initializeRecorder(stream) {
  audioContext = window.AudioContext;
  context = new audioContext();
  audioInput = context.createMediaStreamSource(stream);

  // setup a analyzer
  analyser = context.createAnalyser();
  analyser.smoothingTimeConstant = 0.3;
  analyser.fftSize = 128;
  soundArray =  new Uint8Array(analyser.frequencyBinCount);

  // create a javascript node
  recorder = context.createScriptProcessor(bufferSize, 1, 1);
  // specify the processing function
  recorder.onaudioprocess = recorderProcess;
  // connect stream to our recorder
  audioInput.connect(analyser);
  // connect our recorder to the previous destination
  recorder.connect(context.destination);
}

function recorderProcess(e) {
    // get the average, bincount is fftsize / 2
    analyser.getByteFrequencyData(soundArray);
    var sum = soundArray.reduce((pv, cv) => pv + cv, 0);
    var average = sum / soundArray.length;
    average = parseInt(average / 10) * 10;

    if(average > maxMeasured) {
        maxMeasured = average;
        relative = 765 / maxMeasured;
    }

    var relativeColor = parseInt(average * relative);
    
    var red = relativeColor < 255 ? relativeColor : 255;
    var green = relativeColor % 255 < 255 ? relativeColor % 255 : 255;
    var blue = relativeColor % 510;

    //body.style.backgroundColor = 'rgb('+red+','+green+','+blue+')';
    
    ctx.fillStyle = 'rgb('+red+','+green+','+blue+')';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /*
    // clear the current state
    ctx.clearRect(0, 0, 60, 130);

    var my_gradient=ctx.createLinearGradient(0,0,170,0);
    my_gradient.addColorStop(0,"black");
    my_gradient.addColorStop(1,"white");

    // set the fill style
    ctx.fillStyle=my_gradient;

    // create the meters
    ctx.fillRect(0,130-average,25,130);
    //console.log(average);
    */
}