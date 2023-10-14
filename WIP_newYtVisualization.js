(async () => {
  // <video>要素からMediaStreamを取得
  const videoElement = document.querySelector('video');
  const mediaStream = videoElement.captureStream();

  // AudioContextとAnalyserNodeの作成
  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048; // FFTサイズを設定

  // MediaStreamをAudioContextに接続
  const source = audioContext.createMediaStreamSource(mediaStream);
  source.connect(analyser);

  // スペクトログラムを描画するための準備
  const canvas = document.getElementById('canvas');
  const canvasCtx = canvas.getContext('2d');
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  // スペクトログラムの描画
  function draw() {
    analyser.getByteFrequencyData(dataArray);
    
    canvasCtx.fillStyle = 'rgb(0, 0, 0)';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    const barWidth = (canvas.width / bufferLength);
    let barHeight;
    let x = 0;

    for(let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i];
      
      canvasCtx.fillStyle = `rgb(${barHeight + 100},50,50)`;
      canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

      x += barWidth + 1;
    }
    
    requestAnimationFrame(draw);
  }

  draw();
})();