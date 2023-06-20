import lightMesh from 'bundle-text:../assets/Light.obj'
import vertexShaderSource from "./shaders/objectVertexShader.vert";
import fragShaderSource from "./shaders/object_fragment_shader.frag";

class Light extends Item {
    speed = 0.2;

    constructor(speed) {
        super("light", lightMesh, vertexShaderSource, fragShaderSource)
        this.speed = speed

    }

    start() {
        //this.transform.rotation.y = Math.PI;
        this.transform.scale = new Vector3(0.02, 0.03, 0.02);
    }

    update() {
        const init_pos = -320;


        if (this.transform.position.z >= -init_pos) {
            this.transform.position.z = init_pos;
            //const item = this.xPositions[Math.floor(Math.random()*this.xPositions.length)];
            //this.transform.position.x = item;
        }

        this.transform.position.z += this.speed;

    }



    changeSpeed(speed) {
        this.speed = speed
    }
}

export default Light;