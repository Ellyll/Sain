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
            const analyserBufferLength = analyser.frequencyBinCount;
            //console.log('bufferLength: ' + bufferLength);
            const dataArray = new Uint8Array(analyserBufferLength);
        
            const buffer = new Array();
            for (let n = 0 ; n < 128 ; n++) {
                let element = new Uint8Array(analyserBufferLength);
                buffer.push(element);
            }
            console.log( { buffer });

            window.addEventListener('resize', () => {
                maximiseCanvas(context.canvas);
                draw(canvas, context, audioCtx, analyser, buffer, analyserBufferLength, stream);
            });
        
            draw(canvas, context, audioCtx, analyser, buffer, analyserBufferLength, stream);
        })
        .catch((err) => {
            console.error(err);
        });
});

function draw(canvas, context, audioCtx, analyser, buffer, analyserBufferLength, stream) {

    const dataArray = buffer.shift();
    console.log({ buffer, dataArray });
    analyser.getByteFrequencyData(dataArray);
    buffer.push(dataArray);

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    //context.clearRect(0, 0, WIDTH, HEIGHT);
    context.fillStyle = "rgb(0, 0, 0)";
    context.fillRect(0, 0, WIDTH, HEIGHT);

    for (let i = buffer.length - 1 ; i >= 0 ; i--)
        drawLine(context, buffer[i], WIDTH, HEIGHT - (i*4));

    let maxValue = dataArray.reduce( (prev, curr) => Math.max(prev, curr), 0);
    context.fillStyle = '#A00';
    context.fillText(maxValue, 5, 20);

    //console.log({bufferLength, barWidth, dataArray });
    window.requestAnimationFrame(() => draw(canvas, context, audioCtx, analyser, buffer, analyserBufferLength, stream));
}

function drawLine(context, dataArray, width, height) {

    const barWidth = (width / dataArray.length) * 2.5;
    let barHeight;
    let x = 0;
  
    context.beginPath();

    context.strokeStyle = '#55C';

    for (let i = 0; i < dataArray.length; i++) {
        barHeight = dataArray[i];
        if (i === 0)
            context.moveTo(0, height - barHeight / 2);
        else
            context.lineTo(x, height - barHeight / 2);
  
        x += barWidth + 1;
    }
    context.lineTo(width, height);
    context.stroke();
}

function maximiseCanvas(canvas) {
    const maxX = window.innerWidth - 5;
    const maxY = window.innerHeight - 5;
    canvas.width = maxX;
    canvas.height = maxY;
}
