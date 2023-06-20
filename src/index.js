import Road from "./road";
import Car from "./car";
import Obstacle from "./obstacle";
import Light from "./light";


const gameState = {
    onLamps: true,
    onMoon: true,
    event: {
        pressedButtonChar: ''
    }
}

let lastTick = performance.now()



let speed = 0.5
let allObject = []



const lights = [];
for (let i = 0; i < 4; i++) {
    const light = new Light(speed)
    light.transform.position.z = i * 50;
    light.transform.position.x = -15;
    light.transform.rotation.y = Math.PI;

    const light2 = new Light(speed)
    light2.transform.position.z = i * 50;
    light2.transform.position.x = 15;
    lights.push(light,light2)
    allObject.push(light,light2)
}


let road = new Road(speed, 0, 0.01, 0, lights)
allObject.push(road)
let road2 = new Road(speed, 0, 0, -320, lights)
allObject.push(road2)
let obstacle = new Obstacle(speed, lights)
allObject.push(obstacle)
let obstacle2 = new Obstacle(speed, lights)
obstacle2.transform.position.z += 50;
allObject.push(obstacle2)



let obstacles = []
obstacles.push(obstacle, obstacle2)

let carLights = {
    left: null,
    right: null
}

let car = new Car(obstacles,
    function (){
        speed += 0.005
        for (const objectOnScene of [road, road2, obstacle, obstacle2, ...lights]) {
            objectOnScene.changeSpeed(speed)
        }
    },
    function (){
        speed -= 0.01
        if (speed < 0.1) {
            speed = 0.1
        }
        for (const objectOnScene of [road, road2, obstacle, obstacle2, ...lights]) {
            objectOnScene.changeSpeed(speed)
        }
    },
    lights, carLights
    )
allObject.push(car)

function start() {
    document.addEventListener('keydown', onKeyDown, false)
    document.addEventListener('keyup', onKeyUp, false)

    function onKeyDown(event){
        gameState.event.pressedButtonChar = event.key;
        console.log(event.key)
        switch (event.key){
            case '-':
                gameState.onLamps = !gameState.onLamps;
                break;
            case '+':
                gameState.onMoon = !gameState.onMoon;
                break;
        }
    }
    function onKeyUp(event){
        gameState.event.pressedButtonChar = '';
    }

    allObject.forEach(obj => {
        obj.start()
    })
    gameLoop()
}


function gameLoop() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    const nowish = performance.now()
    const delta = nowish - lastTick
    lastTick = nowish
    update(delta)
    draw(delta);
    requestAnimationFrame(gameLoop)
}

function update(delta) {
    allObject.forEach(obj => {
        obj.update(gameState.event.pressedButtonChar)
    })
}

function draw(delta) {
    allObject.forEach(obj => {
        obj.draw(gameState, carLights)
    })
}

start()