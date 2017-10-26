// wae-main.js


// RequireJS Configuration
requirejs.config({
    baseUrl: './js/wae',
    paths: {
        'WAECore': './wae-core',
        'glMatrix': './external/gl-matrix-min'
    },
    
    // Use it in dev to bust cache
    urlArgs: 'bust=' +  (new Date()).getTime()
    
});


// RequireJS Main
requirejs(
    
    // Load all modules
    ['glMatrix', 'WAECore'],
    
    // main()
    function (glMatrix, WAECore) {
        
        // Global WAE objects
        var t_Scene = null;       // TODO: WAESceneManager

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
        
        function loadImages(urlArray) {
            var newImages = [], loadedCount = 0;
            var callBack = function () {};
            function imageLoaded() {
                loadedCount++;
                if (loadedCount == urlArray.length) {
                    callBack(newImages);
                }
            }
            for (var i = 0; i < urlArray.length; i++) {
                newImages[i] = new Image();
                newImages[i].src = urlArray[i];
                newImages[i].onload = function () {
                    imageLoaded();
                }
                newImages[i].onerror = function () {
                    console.log('[WARNING] "' + urlArray[i] + '" load failed.');
                    imageLoaded();
                }
            }
            return {
                done: function (userFunction) {
                    callBack = userFunction || callBack;
                }
            }
        }

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
                alert('Unable to initialize the shader program: ' + gl.getshaderProgramInfoLog(shaderProgram));
                return null;
            }
            return shaderProgram;
        }
        
        function initGLConfig(gl, shaderProgramInfo) {
            
            // Set clearing options
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clearDepth(1.0);
            gl.enable(gl.BLEND);
            
            // Set the projection matrix:
            // Create a orthogonal projection matrix for 640x480 viewport
            const left = -320;
            const right = 320;
            const bottom = -240;
            const top = 240;
            const zNear = 0.1;
            const zFar = 100.0;
            const projectionMatrix = glMatrix.mat4.create();
            glMatrix.mat4.ortho(projectionMatrix, left, right, bottom, top, zNear, zFar);
            
            // Set the model view matrix:
            // Under change based on camera (TODO)
            const modelViewMatrix = glMatrix.mat4.create();
            glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -6.0]);
            
            // Tell WebGL to use our program when drawing
            gl.useProgram(shaderProgramInfo.program);

            // Set the shader uniforms
            // In this example, projection and model view matrices are passed as uniforms.
            gl.uniformMatrix4fv(shaderProgramInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
            gl.uniformMatrix4fv(shaderProgramInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
            
            // Tell WebGL we want to affect texture unit 0 and bound the texture to texture unit 0 (gl.TEXTURE0)
            gl.activeTexture(gl.TEXTURE0);
            gl.uniform1i(shaderProgramInfo.uniformLocations.uSampler, 0);
            
            // Turn on attribute array
            gl.enableVertexAttribArray(shaderProgramInfo.attribLocations.vertexPosition);
            gl.enableVertexAttribArray(shaderProgramInfo.attribLocations.textureCoord);
            
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            
            WAECore.spriteBatcher.init(gl);
            
        }

        function loadSpriteSheets(gl, loadedImages, ssList) {
            
            // Balloon
            {
                var ss = new WAECore.SpriteSheet({
                    ssid: 0,
                    rowCount: 2,
                    colCount: 5,
                    cellWidth: 20,
                    cellHeight: 20
                });
                ss.loadTextureFromImage(gl, loadedImages[0]);
                ssList[0] = ss;
            }
            
            // BG
            {
                var ss = new WAECore.SpriteSheet({
                    ssid: 1,
                    rowCount: 1,
                    colCount: 1,
                    cellWidth: 80,
                    cellHeight: 64
                });
                ss.loadTextureFromImage(gl, loadedImages[1]);
                ssList[1] = ss;
            }
            
            // for (var i = 0; i < loadedImages.length; i++) { }
        }
        
        function loadGameObjects(ssList, objList) {
            
            {
                var f1 = new WAECore.Frame({
                    spriteSheet: ssList[0],
                    cellIndex: 0,
                    cellCount: 1,
                    center: { x: 10, y: 10 }
                });
                var f2 = new WAECore.Frame({
                    spriteSheet: ssList[0],
                    cellIndex: 1,
                    cellCount: 1,
                    center: { x: 10, y: 10 }
                });
                var f3 = new WAECore.Frame({
                    spriteSheet: ssList[0],
                    cellIndex: 2,
                    cellCount: 1,
                    center: { x: 10, y: 10 }
                });
                var anim = new WAECore.Animation({
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
                var obj = new WAECore.StoredObject({
                    oid: 0,
                    type: 0,
                    name: 'Balloon'
                });
                obj.addAnimationAt(0, anim);
                objList[0] = obj;
            }
            
            {
                var f1 = new WAECore.Frame({
                    spriteSheet: ssList[1],
                    cellIndex: 0,
                    cellCount: 1,
                    center: { x: 40, y: 32 }
                });
                var anim = new WAECore.Animation({
                    name: 'Idle',
                    frameCount: 1,
                    isLoop: true,
                    next: 0,
                    ttl: 0
                });
                anim.addFrame(0, f1, 10);
                var obj = new WAECore.StoredObject({
                    oid: 0,
                    type: 0,
                    name: 'BG'
                });
                obj.addAnimationAt(0, anim);
                objList[1] = obj;
            }
            
        }

        function initGameplay(objList) {
            t_Scene = new WAECore.Scene();
            t_Scene.addSprite(new WAECore.Sprite({
                object: objList[0],
                action: 0,
                team: 0,
                position: { x: 0, y: 0 },
                zDepth: 0
            }));
            t_Scene.addSprite(new WAECore.Sprite({
                object: objList[1],
                action: 0,
                team: 0,
                position: { x: 0, y: 8 },
                zDepth: 0
            }));
        }

        function update() {
            t_Scene.update();
        }

        function render(gl, shaderProgramInfo, buffers, texture) {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            t_Scene.render();
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
        const shaderProgramInfo = {
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
        
        initGLConfig(gl, shaderProgramInfo);
        
        var imageUrls = [
            './assets/texture/balloon.png',
            './assets/texture/bg.png'
        ];
        
        loadImages(imageUrls).done(function (newImages) {
            
            loadSpriteSheets(gl, newImages, WAECore.spriteSheetList);
            loadGameObjects(WAECore.spriteSheetList, WAECore.objectList);
            initGameplay(WAECore.objectList);
            
            var start = null;
        
            function mainLoop(now) {
                if (!start) start = now;
                var delta = (now - start) / 1000.0;
                var fps = 1.0 / delta;
                // console.log(fps);
                start = now;
                var buffers = update();
                render(gl, shaderProgramInfo, buffers);
                window.requestAnimationFrame(mainLoop);
            }
            
            window.requestAnimationFrame(mainLoop);

        });

        
    }

);