import carMesh from 'bundle-text:../assets/car.obj'
import fragShaderSource from './shaders/object_fragment_shader.frag'
import vertexShaderSource from './shaders/objectVertexShader.vert'

class Car extends Item {
    initYrot = Math.PI;

    carWidth = 5;
    _obstacles

    _move_objects;
    _setSlowEvent;
    _isSlow = false;

    /**
     *
     * @param step
     * @private
     */
    ClampYRotate(step = 0.005) {
        if (Math.abs(this.initYrot - this.transform.rotation.y) > step) {
            this.transform.rotation.y += Math.sign(this.initYrot - this.transform.rotation.y) * 0.005;
        }
    }

    //  constructor(obstacles, loseEvent, setSlowEvent, setFastEvent) {
    constructor(obstacles, setFastEvent, setSlowEvent, lights, carLights) {
        super("car", carMesh, vertexShaderSource, fragShaderSource, lights)

        carLights.left = new Transform(new Vector3(-2.5, 5.5, 19.5), new Vector3(0, 0, 0), new Vector3(0, 0, 0));
        carLights.right = new Transform(new Vector3(2.5, 5.5, 19.5), new Vector3(0, 0, 0), new Vector3(0, 0, 0));

        this._carLights = carLights
        this._obstacles = obstacles;
        this._setSlowEvent = setSlowEvent;
        this._setFastEvent = setFastEvent;
    }

    changeCarLightsX(delta) {
        this._carLights.left.position.x += delta
        this._carLights.right.position.x += delta
        console.log(this._carLights)
    }

    /**
     * @public
     */
    start() {
        this.transform.rotation.y = 3.1415
        this.transform.scale.x = 0.04;
        this.transform.scale.y = 0.04;
        this.transform.scale.z = 0.04;
        this.transform.position.z = 10;
        this.transform.position.y = 3.3;
    }

    /**
     * @public
     */
    update(event) {
        switch (event) {
            case 'd':
                if (this.transform.position.x >= 11) {
                    break
                }
                this.transform.position.x += 0.2;
                this.changeCarLightsX(0.2)
                this.transform.rotation.y = this.initYrot + 0.08;
                break;
            case 'a':
                if (this.transform.position.x <= -11) {
                    break
                }
                this.changeCarLightsX(-0.2)
                this.transform.position.x -= 0.2;
                this.transform.rotation.y = this.initYrot - 0.08;
                break;
            case 'w':
                this._setFastEvent()
                break;
            case 's':
                this._setSlowEvent()
                break;
        }
        this.ClampYRotate();

        for (const obstacle of this._obstacles) {
            const tempVec = this.transform.position;
            const pos = new Vector3(tempVec.x, tempVec.y, tempVec.z - 4);
            if (Vector3.distance(obstacle.transform.position, pos) < this.carWidth) {
                alert("YOU LOSE");
            }
        }

        // set slow

        // if(Math.abs(this.transform.position.x) > 13 ){
        //     this._isSlow = true;
        //     this._setSlowEvent();
        // }
        // else if(this._isSlow){
        //     this._setFastEvent();
        // }
    }
}

export default Car;