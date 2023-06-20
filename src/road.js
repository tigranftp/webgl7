import roadMesh from 'bundle-text:../assets/road.obj'
import fragShaderSource from './shaders/object_fragment_shader.frag'
import vertexShaderSource from './shaders/objectVertexShader.vert'
class Road extends Item {
    speed = 0.2;

    constructor(speed, x, y, z, lights) {
        super('road', roadMesh, vertexShaderSource, fragShaderSource, lights);
        this.speed = speed
        this.transform.position.z = z;
        this.transform.position.y = y;
    }

    start() {
        this.transform.scale.x = 1;
        this.transform.scale.y = 1;
        this.transform.scale.z = 1.6;
        this.transform.rotation.z = 3.1415;
    }

    update(event) {
        const init_pos = -320;
        if (this.transform.position.z >= -init_pos) {
            this.transform.position.z = init_pos;
        }

        this.transform.position.z += this.speed;
    }

    changeSpeed(speed) {
        this.speed = speed
    }
}


export default Road;