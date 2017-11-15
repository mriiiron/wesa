// wae-object.js

define(

    // Module Dependencies
    ['glMatrix'],
    
    // Module Definition
    function (glMatrix) {
                
        // Shader program source codes
        const shaderSource = {
            vs: `
                attribute vec4 aVertexPosition;
                attribute vec2 aTextureCoord;
                uniform mat4 uModelViewMatrix;
                uniform mat4 uProjectionMatrix;
                varying highp vec2 vTextureCoord;
                void main() {
                    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
                    vTextureCoord = aTextureCoord;
                }
            `,
            fs: `
                varying highp vec2 vTextureCoord;
                uniform sampler2D uSampler;
                void main(void) {
                    gl_FragColor = texture2D(uSampler, vTextureCoord);
                }
            `
        };
        
        
        function loadShader(gl, type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
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
                console.error('Unable to initialize the shader program: ' + gl.getshaderProgramInfoLog(shaderProgram));
                return null;
            }
            return shaderProgram;
        }
        
        function initGLConfig(canvas, gl, shaders) {
            
            // Set clearing options
            gl.clearColor(0.0, 0.125, 0.0, 1.0);
            gl.clearDepth(1.0);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            
            // Set the projection matrix:
            // Create a orthogonal projection matrix for 480x640 viewport
            const left = -canvas.width / 2;
            const right = canvas.width / 2;
            const bottom = -canvas.height / 2;
            const top = canvas.height / 2;
            const zNear = 0.1;
            const zFar = 100.0;
            const projectionMatrix = glMatrix.mat4.create();
            glMatrix.mat4.ortho(projectionMatrix, left, right, bottom, top, zNear, zFar);
            
            // Set the model view matrix:
            // Under change based on camera (TODO)
            const modelViewMatrix = glMatrix.mat4.create();
            glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -6.0]);
            
            // Tell WebGL to use our program when drawing
            gl.useProgram(shaders.program);

            // Set the shader uniforms
            // In this example, projection and model view matrices are passed as uniforms.
            gl.uniformMatrix4fv(shaders.uniformLocations.projectionMatrix, false, projectionMatrix);
            gl.uniformMatrix4fv(shaders.uniformLocations.modelViewMatrix, false, modelViewMatrix);
            
            // Tell WebGL we want to affect texture unit 0 and bound the texture to texture unit 0 (gl.TEXTURE0)
            gl.activeTexture(gl.TEXTURE0);
            gl.uniform1i(shaders.uniformLocations.uSampler, 0);
            
            // Turn on attribute array
            gl.enableVertexAttribArray(shaders.attribLocations.vertexPosition);
            gl.enableVertexAttribArray(shaders.attribLocations.textureCoord);

        }
        
        
        return {
            shaderSource: shaderSource,
            initShaderProgram: initShaderProgram,
            initGLConfig: initGLConfig
        };
        
    }

);