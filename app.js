document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    maximiseCanvas(context.canvas);

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioCtx.createAnalyser();
            const source = audioCtx.createMediaStreamSource(stream);
            analyser.minDecibels = -90;
            analyser.maxDecibels = -10;
            analyser.smoothingTimeConstant = 0.85;
            source.connect(analyser);     
                    
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            console.log('bufferLength: ' + bufferLength);
            const dataArray = new Uint8Array(bufferLength);
        
            analyser.getByteFrequencyData(dataArray);
            console.log(dataArray);

            window.addEventListener('resize', () => {
                maximiseCanvas(context.canvas);
                draw(canvas, context, audioCtx, analyser, dataArray, bufferLength, stream);
            });
        
            draw(canvas, context, audioCtx, analyser, dataArray, bufferLength, stream);
        })
        .catch((err) => {
            console.error(err);
        });
});

function draw(canvas, context, audioCtx, analyser, dataArray, bufferLength, stream) {
    analyser.getByteFrequencyData(dataArray);

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    //context.clearRect(0, 0, WIDTH, HEIGHT);
    context.fillStyle = "rgb(0, 0, 0)";
    context.fillRect(0, 0, WIDTH, HEIGHT);

    const barWidth = (WIDTH / bufferLength) * 2.5;
    let barHeight;
    let x = 0;
  
    let wasData = false;
    context.beginPath();
    context.strokeStyle = '#55C';
    //context.moveTo(0, HEIGHT);
    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i];
      if (barHeight != 0)
        wasData = true;
  
    //   context.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
    //   context.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);
        if (i === 0)
            context.moveTo(0, HEIGHT - barHeight / 2);
        else
            context.lineTo(x, HEIGHT - barHeight / 2);
  
      x += barWidth + 1;
    }
    context.lineTo(WIDTH, HEIGHT);
    context.stroke();
    // if (!wasData) {
    //     context.fillStyle = '#A00';
    //     context.fillText('No data', 5, 20);
    // }
    let maxValue = dataArray.reduce( (prev, curr) => Math.max(prev, curr), 0);
    context.fillStyle = '#A00';
    context.fillText(maxValue, 5, 20);

    //console.log({bufferLength, barWidth, dataArray });
    window.requestAnimationFrame(() => draw(canvas, context, audioCtx, analyser, dataArray, bufferLength, stream));
}

function maximiseCanvas(canvas) {
    const maxX = window.innerWidth - 5;
    const maxY = window.innerHeight - 5;
    canvas.width = maxX;
    canvas.height = maxY;
}
