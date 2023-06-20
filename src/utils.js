const mainCanvas = document.getElementById('mainCanvas')
const gl = mainCanvas.getContext('webgl2', {antialias: false});


function degToRad(deg) {
    return deg * Math.PI / 180;
}