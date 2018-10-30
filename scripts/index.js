(() => {

  const DETECTION_INTERVAL_MILLIS = 2000;

  const video = document.getElementById('video');
  const pageIntro = document.getElementById('page-intro');
  const pageDetector = document.getElementById('page-detector');

  let predictionModel;

  function detectLlamas() {

    setInterval(() => {

      console.log('TEST 3');

      predictionModel.classify(video).then(predictions => {

        console.log('TEST 4');

        const topResult = predictions[0];
  
        if (topResult.className === 'llama') {
          console.log('*** OMG llama!', topResult);
        } else {
          console.log('No llama...', predictions);
        }
    
      })
      .catch(err => {
        console.error('classify error', err);
        // TODO showUnsupported();
      });;

    }, DETECTION_INTERVAL_MILLIS);
    
  }

  function setupCamera() {

    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight;

    const constraints = {
      width: {ideal: maxWidth, max: maxWidth},
      height: {ideal: maxHeight, max: maxHeight}
     };

     // Need to set dimensions explicitly on the video element for tensorflow
     // (https://github.com/tensorflow/tfjs/issues/322)
     video.width = maxWidth;
     video.height = maxHeight;

     navigator.mediaDevices.getUserMedia({audio: false, video: constraints})
      .then(stream => {

        const videoTracks = stream.getVideoTracks();

        console.log('Using video device: ' + videoTracks[0].label);

        stream.oninactive = function() {
          console.log('Stream inactive');
        };

        if ('srcObject' in video) {
          video.srcObject = stream;
        } else {
          video.src = window.URL.createObjectURL(stream);
        }

        console.log('TEST 1');

        mobilenet.load().then(model => {
          predictionModel = model;
          console.log('TEST 2');
          detectLlamas();
        });

      })
      .catch(err => {
        console.error('getUserMedia error', err);
        // TODO showUnsupported();
      });

  }

  function init() {

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // TODO showUnsupported();
        return;
      }
      
      const btnGo = document.getElementById('btn-go');

      btnGo.addEventListener('click', () => {

        pageIntro.style.display = 'none';
        pageDetector.style.display = 'block';

        setupCamera();

      });

  }

  init();
    
})();
