// wae-main.js

// Configuration
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

// Main
require(
    
    // Load all modules
    ['WAESpriteSheet', 'WAEFrame', 'WAEAnimation', 'WAEObject', 'WAESprite', 'WAEScene'],
    
    // main()
    function (WAESpriteSheet, WAEFrame, WAEAnimation, WAEObject, WAESprite, WAEScene) {

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
		
		function initOthers() {
			
		}
	
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
        
        console.log(obj);
        

		function updateScene() {
			
		}
		
		function drawScene() {
			
		}
		
        var start = null;
        
        function mainLoop(now) {
            if (!start) start = now;
            var delta = (now - start) / 1000.0;
			var fps = 1.0 / delta;
			// console.log(fps);
            start = now;
            updateScene();
            drawScene();
            window.requestAnimationFrame(mainLoop);
        }
        
        window.requestAnimationFrame(mainLoop);
        
    }

);