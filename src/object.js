class Item {

    transform;
    lights;
    brightness = 2;

    constructor(textureUrl, mesh, vs, fs, lights) {
        this.transform = new Transform(new Vector3(0, 0, 0), new Vector3(1, 1, 1), new Vector3(0, 0, 0))
        this.gl = gl;

        this.SetupMesh(mesh, vs, fs);

        this.registerTexture(textureUrl);
        this.gl.enable(this.gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        //this.afterDraw = afterDraw;

        this.lights = lights !== undefined ? lights : [];
    }



    getCarBackLightsPosition(CarBackLights) {
        const result = [];
        result.push( CarBackLights.left.position.x,  CarBackLights.left.position.y,  CarBackLights.left.position.z);
        result.push( CarBackLights.right.position.x,  CarBackLights.right.position.y,  CarBackLights.right.position.z);
        return result;
    }

    getLightsPosition() {
        const result = [];
        for (const light of this.lights) {
            result.push(light.transform.position.x, light.transform.position.y, light.transform.position.z);
        }
        return result;
    }

    SetupMesh(mesh, vertexShaderSource, fragShaderSource) {
        this.meshProgramInfo = webglUtils.createProgramInfo(gl, [vertexShaderSource, fragShaderSource]);

        const data = this.parseOBJ(mesh);
        this.bufferInfo = webglUtils.createBufferInfoFromArrays(gl, data);

        this.cameraTarget = [0, 0, 0];
        this.cameraPosition = [60, 15, -15];
        this.zNear = 0.1;
        this.zFar = 180;

        gl.useProgram(this.meshProgramInfo.program);
    }


    parseOBJ(text) {
        // because indices are base 1 let's just fill in the 0th data
        const objPositions = [[0, 0, 0]];
        const objTexcoords = [[0, 0]];
        const objNormals = [[0, 0, 0]];

        // same order as `f` indices
        const objVertexData = [
            objPositions,
            objTexcoords,
            objNormals,
        ];

        // same order as `f` indices
        let webglVertexData = [
            [],   // positions
            [],   // texcoords
            [],   // normals
        ];

        function addVertex(vert) {
            const ptn = vert.split('/');

            ptn.forEach(
                /**
                 *
                 * @param objIndexStr {string}
                 * @param i
                 */
                (objIndexStr, i) => {
                    if (!objIndexStr) {
                        return;
                    }
                    const objIndex = parseInt(objIndexStr);
                    const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
                    webglVertexData[i].push(...objVertexData[i][index]);
                });
        }

        const keywords = {
            v(parts) {
                objPositions.push(parts.map(parseFloat));
            },
            vn(parts) {
                objNormals.push(parts.map(parseFloat));
            },
            vt(parts) {
                // should check for missing v and extra w?
                objTexcoords.push(parts.map(parseFloat).slice(0,2));
            },
            f(parts) {
                const numTriangles = parts.length - 2;
                for (let tri = 0; tri < numTriangles; ++tri) {
                    addVertex(parts[0]);
                    addVertex(parts[tri + 1]);
                    addVertex(parts[tri + 2]);
                }
            },
        };

        const keywordRE = /(\w*)(?: )*(.*)/;
        const lines = text.split('\n');
        for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
            const line = lines[lineNo].trim();
            if (line === '' || line.startsWith('#')) {
                continue;
            }
            const m = keywordRE.exec(line);
            if (!m) {
                continue;
            }
            const [, keyword, unparsedArgs] = m;
            const parts = line.split(/\s+/).slice(1);
            const handler = keywords[keyword];
            if (!handler) {
                console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
                continue;
            }
            handler(parts, unparsedArgs);
        }

        return {
            position: webglVertexData[0],
            texcoord: webglVertexData[1],
            normal: webglVertexData[2],
        };
    }


    registerTexture(imgId) {
        let texture = this.texture = gl.createTexture();
        const image = document.getElementById(imgId)

        if (image.complete) {
            this.handleTextureLoaded(image, texture);
        }

        const samplerUniform = gl.getUniformLocation(this.meshProgramInfo.program, "u_texture");
        gl.uniform1i(samplerUniform, 0);
        return texture
    }

    handleTextureLoaded(image, texture) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    }

    draw(gameState, carBackLights) {
        const gl = this.gl;

        webglUtils.resizeCanvasToDisplaySize(gl.canvas);


        const fieldOfViewRadians = degToRad(60);
        const projection = m4.perspective(fieldOfViewRadians, 1.5, this.zNear, this.zFar);

        const up = [0, 1, 0];
        // Compute the camera's matrix using look at.
        const camera = m4.lookAt(this.cameraPosition, this.cameraTarget, up);

        // Make a view matrix from the camera matrix.
        const view2 = m4.inverse(camera);

        const sharedUniforms = {
            u_onLamps: gameState.onLamps ? 1.0 : 0.0,
            u_carBackLightsPosition: this.getCarBackLightsPosition(carBackLights),
            u_lightPos: [-100, 100, 100],
            u_view: view2,
            u_projection: projection,
            position: this.transform.position.getArray(),
            rotation: this.transform.rotation.getArray(),
            scale: this.transform.scale.getArray(),
            u_texture: this.texture
        };

        gl.useProgram(this.meshProgramInfo.program);

        // calls gl.uniform
        webglUtils.setUniforms(this.meshProgramInfo, sharedUniforms);

        // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
        webglUtils.setBuffersAndAttributes(gl, this.meshProgramInfo, this.bufferInfo);

        // calls gl.uniform
        webglUtils.setUniforms(this.meshProgramInfo, {
            u_world: m4.yRotation(2),
            u_diffuse: [1, 0.7, 0.5, 1],
            lights_position: this.getLightsPosition(),
            brightness: this.brightness,
        });

        webglUtils.drawBufferInfo(gl, this.bufferInfo);

    }

}


// TRANSFORM + VECTOR3 CLASS

class Vector3 {
    /**
     *
     * @param x {number}
     * @param y {number}
     * @param z {number}
     */
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * @public
     * @param vector {Vector3}
     * @returns {Vector3}
     */
    static normalize(vector) {
        let znam = vector.x * vector.x + vector.y * vector.y + vector.z * vector.z;
        znam = Math.sqrt(znam);
        const result = new Vector3(vector.x / znam, vector.y / znam, vector.z / znam);
        return result;
    }

    /**
     *
     * @param lhs {Vector3}
     * @param rhs {Vector3}
     * @returns {Vector3}
     */
    static cross(lhs, rhs) {
        return new Vector3(
            lhs.y * rhs.z - lhs.z * rhs.y,
            lhs.z * rhs.x - lhs.x * rhs.z,
            lhs.x * rhs.y - lhs.y * rhs.x
        );
    }

    /**
     *
     * @param vec1 {Vector3}
     * @param vec2 {Vector3}
     * @returns {number}
     */
    static dot(vec1, vec2) {
        return vec1.x * vec2.x + vec1.y * vec2.y + vec1.z * vec2.z;
    }

    /**
     *
     * @param vec1 {Vector3}
     * @param vec2 {Vector3}
     * @returns {number}
     */
    static distance(vec1, vec2) {
        const x = vec1.x - vec2.x;
        const y = vec1.y - vec2.y;
        const z = vec1.z - vec2.z;
        return Math.sqrt(x * x + y * y + z * z);
    }

    /**
     *
     * @returns {number[]}
     */
    getArray() {
        return [this.x, this.y, this.z];
    }
}

class Transform {
    constructor(position, scale, rotation) {
        this.position = position;
        this.scale = scale;
        this.rotation = rotation;
    }


    copy() {
        return new Transform(new Vector3(this.position.x, this.position.y, this.position.z),
            new Vector3(this.scale.x, this.scale.y, this.scale.z),
            new Vector3(this.rotation.x, this.rotation.y, this.rotation.z))
    }
}
