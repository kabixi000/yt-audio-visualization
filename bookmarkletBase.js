// 以下consoleに貼り付ける用
(()=>{

  const videoElm = document.getElementsByTagName('video')[0]

  let cWidth=parseInt(videoElm.style.width)||1280
  let cHeight=150

  let volumeNum = 1.0
  let fftVolume = 1.2

  const fftSize = 8192
  let frequencyBinCount = 0
  let sampleRate = 0
  const minFreq = 80 *2
  const maxFreq = 18000 *2
  let minFreqIndex = 0
  let maxFreqIndex = 0
  const minFreqGain = -95
  const maxFreqGain = -30

  const draw = (ctx,analyser)=>{
    const data = new Uint8Array(analyser.frequencyBinCount)
    const freqData = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteTimeDomainData(data)
    analyser.getByteFrequencyData(freqData)

    ctx.fillStyle = '#000'
    ctx.fillRect(0,0,cWidth,cHeight)
    ctx.strokeStyle = '#FF0'

    ctx.beginPath()
    const dLength = data.length
    for(let i=0; i<dLength; i++){
      const x = cWidth * (i/dLength)
      const intY = data[i]-128
      const baiY = intY*volumeNum
      const uIntY = baiY+128
      const y = ( uIntY /256 )*cHeight
      if(i===0){
        ctx.moveTo(x,y)
      }else{
        ctx.lineTo(x,y)
      }
    }
    ctx.stroke()

    ctx.beginPath()
    ctx.strokeStyle = '#0F0'
    for(let i=minFreqIndex; i<maxFreqIndex; i++){
      const x = cWidth * (Math.log10(i-minFreqIndex)/Math.log10(maxFreqIndex-minFreqIndex))
      const ty = Math.pow(freqData[i]/256,fftVolume)*(0.5*(fftVolume+1))
      const tmpY = cHeight - (ty*cHeight)
      const y = tmpY<=0?0:tmpY
      if(i===0){
        ctx.moveTo(x,y)
      }else{
        ctx.lineTo(x,y)
      }
    }
    ctx.stroke()

    requestAnimationFrame(draw.bind(null,ctx,analyser))
  }

  const init = (ctx)=>{
    const audioCtx = new window.AudioContext()
    const analyser = audioCtx.createAnalyser()
    analyser.smoothingTimeConstant = 0.1
    analyser.fftSize = fftSize
    frequencyBinCount = analyser.frequencyBinCount
    sampleRate = audioCtx.sampleRate
    minFreqIndex = Math.trunc((minFreq / sampleRate) * frequencyBinCount)
    maxFreqIndex = Math.trunc((maxFreq / sampleRate) * frequencyBinCount)
    analyser.minDecibels = minFreqGain
    analyser.maxDecibels = maxFreqGain
    const source = audioCtx.createMediaElementSource(videoElm)
    source.connect(analyser)
    analyser.connect(audioCtx.destination)
    draw(ctx,analyser)
  }

  const videoPlayer = document.getElementById('player')
  const cvsElm = document.createElement('canvas')
  cvsElm.width=cWidth
  cvsElm.height=cHeight
  cvsElm.style.display='block'
  const ctx = cvsElm.getContext('2d')
  const btn = document.createElement('button')
  btn.innerText = 'Start'
  btn.style.display = 'block'
  btn.addEventListener('click',(e)=>{init(ctx);e.target.style.display='none'})
  const volNumIn = document.createElement('input')
  volNumIn.type = 'number'
  volNumIn.value = 1.0
  volNumIn.addEventListener('change',(e)=>{volumeNum=volNumIn.value})
  const fftVolumeElm = document.createElement('input')
  fftVolumeElm.type = 'number'
  fftVolumeElm.min = 1
  fftVolumeElm.max = 5
  fftVolumeElm.step = 0.01
  fftVolumeElm.value = fftVolume
  fftVolumeElm.addEventListener('input',(e)=>{fftVolume=Number(fftVolumeElm.value)})
  const sizeFitBtn = document.createElement('button')
  sizeFitBtn.innerText = 'SizeFit'
  sizeFitBtn.addEventListener('click',(e)=>{cWidth=parseInt(videoElm.style.width)||1280;cvsElm.width=cWidth})
  videoPlayer.appendChild(cvsElm)
  videoPlayer.appendChild(btn)
  videoPlayer.appendChild(volNumIn)
  videoPlayer.appendChild(fftVolumeElm)
  videoPlayer.appendChild(sizeFitBtn)

})()