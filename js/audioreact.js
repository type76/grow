
function showeq() {
  var xhud = document.getElementById('xhud');
  xhud.classList.toggle('on');
  if (xhud.classList != "on") {
eqbutton.textContent = 'SHOW EQ';
  } else {
eqbutton.textContent = 'HIDE EQ';
  }
}




//
var playing = false;

function playme() {
  playing = true;
  
  
  // buildAudioGraph(); audioContext= new audioCtx(); requestAnimationFrame(visualize2);
  mediaElement.play();

}

function stopme() {
playing = false;
mediaElement.pause();
}

var audioCtx = window.AudioContext || window.webkitAudioContext;
var audioContext, canvasContext;

var filters = [];

var analyser;
var dataArray, bufferLength;
var masterGain, stereoPanner;
var mediaElement = document.getElementById('player');


function buildAudioGraph() {
  var sourceNode =   audioContext.createMediaElementSource(mediaElement);
  
  // Create an analyser node
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
  
  // create the equalizer. It's a set of biquad Filters
    // Set filters
    [60, 170, 350, 1000, 3500, 10000].forEach(function(freq, i) {
      var eq = audioContext.createBiquadFilter();
      eq.frequency.value = freq;
      eq.type = "peaking";
      eq.gain.value = 0;
      filters.push(eq);
    });

   // Connect filters
   sourceNode.connect(filters[0]);
   for(var i = 0; i < filters.length - 1; i++) {
      filters[i].connect(filters[i+1]);
    }
  
    // Master volume
  masterGain = audioContext.createGain();
  masterGain.value = 1;
 
   // last filter
   filters[filters.length - 1].connect(masterGain);
  
  // stereo balancing
  stereoPanner = audioContext.createStereoPanner();
  // master volume output to the panner
  masterGain.connect(stereoPanner);
  
  // stereo panner to analyser
  stereoPanner.connect(analyser);  
  analyser.connect(audioContext.destination);
}



function changeGain(sliderVal,nbFilter) {
  var value = parseFloat(sliderVal);
  filters[nbFilter].gain.value = value;
  
  // update output labels
  var output = document.querySelector("#gain"+nbFilter);
  output.value = value + " dB";
}

function changeMasterGain(sliderVal) {
  var value = parseFloat(sliderVal);
  masterGain.gain.value =  value/10;
  
   // update output labels
  var output = document.querySelector("#masterGainOutput");
  output.value = value;
}

function changeBalance(sliderVal) {
  // between -1 and +1
  var value = parseFloat(sliderVal);
  
stereoPanner.pan.value = value;
   // update output labels
  var output = document.querySelector("#balanceOutput");
  output.value = value;
}



function visualize2() {
  if (playing) {
    analyser.getByteFrequencyData(dataArray);
    var nbFreq = dataArray.length;
  

//
nxtdisc.scale.x = nxtdisc.scale.y = 2+0.1*dataArray[Math.round((20 * nbFreq) / 128)];
//
cursor.position.x = 1+0.1*dataArray[Math.round((2 * nbFreq) / 128)];
cube.scale.x = -(cursor.position.x - cube.scale.x) * 0.5;
cube.scale.z = -(cursor.position.x - cube.scale.z) * 0.5;

gridgroup.scale.x = gridgroup.scale.y = gridgroup.scale.z = -(cursor.position.x - cube.scale.z) * 0.01;

gridgroup.rotation.y += .001;

//
var xcos = 1+0.1*dataArray[Math.round((10 * nbFreq) / 128)];
biggus.scale.set(xcos,xcos,xcos);

// cam rotate
camera.position.z = 1+player.currentTime/2;
// camera.position.y = 1+player.currentTime/40;

// scene rotate
scenegroup.rotation.x += 0.001;
scenegroup.rotation.y += 0.001;
scenegroup.rotation.z += 0.001;

// heartgroup.rotation.y += 0.001;
  } //ifplaying

  renderer.render( scene, camera );
  //    
  requestAnimationFrame(visualize2);
}

