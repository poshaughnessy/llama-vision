(() => {

  const DETECTION_INTERVAL_MILLIS = 2000;

  const video = document.querySelector('video');
  const pages = document.querySelectorAll('.page');
  const supportedDiv = document.getElementById('supported');
  const unsupportedDiv = document.getElementById('unsupported');
  const errorMsg = document.getElementById('error-msg');
  let detecting = false;

  let predictionModel;

  function detectLlamas() {

    setInterval(() => {

      console.log('HERE 3');

      predictionModel.classify(video).then(predictions => {

        console.log('HERE 4');

        if (!detecting) {
          document.body.classList.add('detecting');
          detecting = true;
        }
        
        const topResult = predictions[0];
  
        if (topResult.className === 'llama') {
          console.log('OMG llama!', topResult);
          document.body.classList.add('detected');
        } else {
          console.log('No llama...', predictions);
          document.body.classList.remove('detected');
        }
    
      })
      .catch(err => {
        console.error('classify error', err);
        showUnsupported(err);
      });;

    }, DETECTION_INTERVAL_MILLIS);
    
  }

  function setupCamera() {

    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight;

    const constraints = {
      width: {ideal: maxWidth, max: maxWidth},
      height: {ideal: maxHeight, max: maxHeight},
      facingMode: {exact: 'environment'} // Rear-facing camera
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

        console.log('HERE 1');

        mobilenet.load().then(model => {
          predictionModel = model;
          
          console.log('HERE 2');
          
          detectLlamas();
        })
        .catch(err => {
          console.error('Tensorflow error', err);
          showUnsupported(err);
        });

      })
      .catch(err => {
        console.error('getUserMedia error', err);
        showUnsupported(err);
      });

  }

  function showSupported() {
    showPage('intro');
    supportedDiv.style.display = 'block';
    unsupportedDiv.style.display = 'none';
  }

  function showUnsupported(error) {
    errorMsg.innerHTML = error;
    showPage('intro');
    unsupportedDiv.style.display = 'block';
    supportedDiv.style.display = 'none';
  }

  function showPage(pageName) {
    pages.forEach(page => {
      page.classList.add('hidden');
    });
    const pageEl = document.getElementById(`page-${pageName}`);
    pageEl.classList.remove('hidden');
  }

  function init() {

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showUnsupported();
        return;
      }

      const btnGo = document.getElementById('btn-go');

      btnGo.addEventListener('click', () => {
        setupCamera();
        showPage('detector');
      });

      showSupported();
      
  }

  init();
    
})();
