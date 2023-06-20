import losMesh from 'bundle-text:../assets/los.obj'
import barrelMesh from 'bundle-text:../assets/crossing.obj'
import road_barrier from 'bundle-text:../assets/road_barrier.obj'
import fragShaderSource from './shaders/object_fragment_shader.frag'
import vertexShaderSource from './shaders/objectVertexShader.vert'


const meshArray = [road_barrier, barrelMesh]
const textureArray = ['road_barrier', 'crossing']
const transformArray = [
    new Transform(new Vector3(0, 3, 0), new Vector3(4, 4, 4), new Vector3(0.0, Math.PI/4, 0.0)),
    new Transform(new Vector3(0, 4, 0), new Vector3(0.07, 0.07, 0.07), new Vector3(0.0, 0.0, 0.0))
]
class Obstacle extends Item {
    init_pos = -320;
    speed = 0.2;
    xPositions = [0, 10, -10]
    meshInfo

    constructor(speed, lights) {
        let newMeshInfo = chooseObstacleRandomly()
        super(newMeshInfo.texture, newMeshInfo.mesh, vertexShaderSource, fragShaderSource, lights);
        this.transform = newMeshInfo.transform.copy()
        this.meshInfo = newMeshInfo
        this.transform.position.z = this.init_pos;
        this.speed = speed
    }

    start() {
        this.locateRandomly()
    }

    update() {
        if (this.transform.position.z >= -this.init_pos) {
            this.transform.position.z = this.init_pos;
            this.locateRandomly();
        }

        this.transform.position.z += this.speed;
    }

    /**
     * @private
     */
    locateRandomly() {
        const item = this.xPositions[Math.floor(Math.random() * this.xPositions.length)];
        this.transform.position.x = item;
    }


    changeSpeed(speed) {
        this.speed = speed
    }

    setSlow() {
        this.speed = 0.1;
    }

    setFast() {
        this.speed = 0.3;
    }
}


function chooseObstacleRandomly() {
    let indexOfMesh = Math.floor(Math.random() * meshArray.length)
    return {
        mesh: meshArray[indexOfMesh],
        texture: textureArray[indexOfMesh],
        transform: (transformArray[indexOfMesh]),
    }
}

export default Obstacle;