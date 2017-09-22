// wae-main.js


// RequireJS Configuration
require.config({
    baseUrl: './js/wae-modules',
    paths: {
        'WAESpriteSheet': 'wae-spritesheet',
        'WAEFrame': 'wae-animation-frame',
        'WAEAnimation': 'wae-animation',
        'WAEObject': 'wae-object',
		'WAESprite': 'wae-sprite',
		'WAEScene': 'wae-scene'
    },
    
    // Use it in dev to bust cache
    urlArgs: 'bust=' +  (new Date()).getTime()
    
});


// RequireJS Main
require(
    
    // Load all modules
    ['WAESpriteSheet', 'WAEFrame', 'WAEAnimation', 'WAEObject', 'WAESprite', 'WAEScene'],
    
    // main()
    function (WAESpriteSheet, WAEFrame, WAEAnimation, WAEObject, WAESprite, WAEScene) {
        
        // Global WAE objects
        var wae_ObjectList = [];
        var wae_Scene = null;       // TODO: WAESceneManager

        // Vertex shader program
        const vsSource = `
            attribute vec4 aVertexPosition;
            attribute vec2 aTextureCoord;
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            varying highp vec2 vTextureCoord;
            void main() {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
                vTextureCoord = aTextureCoord;
            }
        `;

        // Fragment shader program
        const fsSource = `
            varying highp vec2 vTextureCoord;
            uniform sampler2D uSampler;
            void main(void) {
                gl_FragColor = texture2D(uSampler, vTextureCoord);
            }
        `;

        function loadShader(gl, type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        }

        function initShaderProgram(gl, vsSource, fsSource) {
            const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
            const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
            const shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);
            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
                return null;
            }
            return shaderProgram;
        }

        function loadGameResources() {
            var ss = new WAESpriteSheet({
                ssid: 0,
                rowCount: 2,
                colCount: 5,
                cellWidth: 20,
                cellHeight: 20
            });
            var f1 = new WAEFrame({
                spriteSheet: ss,
                cellIndex: 0,
                cellCount: 1,
                center: { x: 10, y: 10 }
            });
            var f2 = new WAEFrame({
                spriteSheet: ss,
                cellIndex: 1,
                cellCount: 1,
                center: { x: 10, y: 10 }
            });
            var f3 = new WAEFrame({
                spriteSheet: ss,
                cellIndex: 2,
                cellCount: 1,
                center: { x: 10, y: 10 }
            });
            var anim = new WAEAnimation({
                name: 'Idle',
                frameCount: 4,
                isLoop: true,
                next: 0,
                ttl: 0
            });
            anim.addFrame(0, f1, 10);
            anim.addFrame(1, f2, 20);
            anim.addFrame(2, f3, 30);
            anim.addFrame(3, f2, 40);
            var obj = new WAEObject({
                oid: 0,
                type: 0,
                name: 'Balloon'
            });
            obj.addAnimationAt(0, anim);
            wae_ObjectList[0] = obj;
        }

        function initGameplay() {
            wae_Scene = new WAEScene();
            wae_Scene.addSprite(new WAESprite({
                object: wae_ObjectList[0],
                action: 0,
                team: 0,
                position: { x: 0, y: 0 },
                zDepth: 0
            }));
        }

        function updateScene() {
            wae_Scene.update();
        }

        function renderScene() {
            
            // Clear scene
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clearDepth(1.0);
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // Set the projection matrix:
            // Create a orthogonal projection matrix for 640x480 viewport
            
            const left = -320;
            const right = 320;
            const bottom = -240;
            const top = 240;
            const zNear = 0.1;
            const zFar = 100.0;
            const projectionMatrix = mat4.create();
            mat4.ortho(projectionMatrix, left, right, bottom, top, zNear, zFar);
            
            // Set the model view matrix:
            // Under change based on camera (TODO)
            const modelViewMatrix = mat4.create();
            mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -6.0]);
            
            // Pull positions from the position buffer and put into the vertexPosition attribute.
            {
                const numComponents = 2;
                const type = gl.FLOAT;
                const normalize = false;
                const stride = 0;
                const offset = 0;
                gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
                gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
                gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
            }
            
            // Pull texture coordinates from the texture coordinate buffer
            {
                const numComponents = 2;
                const type = gl.FLOAT;
                const normalize = false;
                const stride = 0;
                const offset = 0;
                gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
                gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, numComponents, type, normalize, stride, offset);
                gl.enableVertexAttribArray( programInfo.attribLocations.textureCoord);
            }
            
            // Tell WebGL to use our program when drawing
            gl.useProgram(programInfo.program);

            // Set the shader uniforms
            // In this example, projection and model view matrices are passed as uniforms.
            gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
            gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

            // Use indice index to draw
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
            
            // Tell WebGL we want to affect texture unit 0
            gl.activeTexture(gl.TEXTURE0);

            // Bind the texture to texture unit 0
            gl.bindTexture(gl.TEXTURE_2D, texture);

            // Tell the shader we bound the texture to texture unit 0
            gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
            
            // Draw a rectangle
            {
                const vertexCount = 6;
                const type = gl.UNSIGNED_SHORT;
                const offset = 0;
                gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
            }
            
        }

        // =====================
        // WHOLE APP STARTS HERE
        // =====================
        
        // Get GL context and create GL object
        const canvas = document.getElementById("glCanvas");
        const gl = canvas.getContext("webgl");
        if (!gl) {
            alert("Unable to initialize WebGL. Your browser or machine may not support it.");
            return;
        }

        // Initialize shader programs
        const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

        // Setup shader input locations
        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
                uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
            }
        };
        
        loadGameResources()
        
        initGameplay();
        
        var start = null;
        
        function mainLoop(now) {
            if (!start) start = now;
            var delta = (now - start) / 1000.0;
			var fps = 1.0 / delta;
			// console.log(fps);
            start = now;
            updateScene();
            // renderScene();
            window.requestAnimationFrame(mainLoop);
        }
        
        window.requestAnimationFrame(mainLoop);
        
    }

);