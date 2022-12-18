const video = document.querySelector('video')

function startVideo() {
  const videoSettings = {
    audio: false, 
    video: {width: 1080, height: 720}
  }

  // Imposta il flusso che deriva dalla webcam come sorgente del video
  navigator.mediaDevices.getUserMedia(videoSettings)
    .then(mediaStream => {
      video.srcObject = mediaStream
      video.onloadmetadata = video.play()
    })
    .catch(error => {
      console.log(error)
    })
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvas(video)
  document.body.append(canvas)
  
  const videoSize = {width: video.width, height: video.height}

  // Recupera i dati dei volti in modo asincrono ogni 200ms
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, 
    new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()

    const canvasDimension = faceapi.resizeResults(detections, videoSize)

    canvas.getContext('2d').clearRect(0, 0, video.width, video.height)
    faceapi.draw.drawDetections(canvas, canvasDimension)
    faceapi.draw.drawFaceExpressions(canvas, canvasDimension)
    faceapi.draw.drawFaceLandmarks(canvas, canvasDimension)
  }, 150)
})

// Carica i modelli, poi fa partire il video
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo())