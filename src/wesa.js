(function (window) {
    'use strict'
    
    function WESACore () {

        // Internal functions (private utilities)
    
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
        
        function initWebGL(canvas, gl, shader) {
            
            // Set clearing options
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
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
            const projectionMatrix = mat4.create();
            mat4.ortho(projectionMatrix, left, right, bottom, top, zNear, zFar);
            
            // Set the model view matrix:
            // Under change based on camera (TODO)
            const modelViewMatrix = mat4.create();
            mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -6.0]);
            
            // Tell WebGL to use our program when drawing
            gl.useProgram(shader.program);

            // Set the shader uniforms
            // In this example, projection and model view matrices are passed as uniforms.
            gl.uniformMatrix4fv(shader.uniformLocations.projectionMatrix, false, projectionMatrix);
            gl.uniformMatrix4fv(shader.uniformLocations.modelViewMatrix, false, modelViewMatrix);
            
            // Tell WebGL we want to affect texture unit 0 and bound the texture to texture unit 0 (gl.TEXTURE0)
            gl.activeTexture(gl.TEXTURE0);
            gl.uniform1i(shader.uniformLocations.uSampler, 0);
            
            // Turn on attribute array
            gl.enableVertexAttribArray(shader.attribLocations.vertexPosition);
            gl.enableVertexAttribArray(shader.attribLocations.textureCoord);

        }
        
        // function loadImages(urlArray) {}
        
        
        // "wesa.res" object
        
        const wesaResource = {
            spriteSheetList: [],
            objectList: []
        }
        
        
        // "wesa.loader" object
        
        const wesaLoader = {
            
            loadImages: function (urlArray) {
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
                        console.warning('[WARNING] "' + urlArray[i] + '" load failed.');
                        imageLoaded();
                    }
                }
                return {
                    done: function (userFunction) {
                        callBack = userFunction || callBack;
                    }
                }
            }
            
        }

        
        // "wesa.core" object
        
        const wesaCore = {
            
            handle: {
                gl: null,
                canvas: null,
                shader: null,
                buffer: null
            },
            
            config: {
                shaderSource: {
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
                }
            },
            
            init: function (canvas) {
                
                if (!canvas || canvas.tagName != 'CANVAS') {
                    console.error('Canvas provided is invalid.');
                    return;
                }
                
                const gl = canvas.getContext("webgl");
                if (!gl) {
                    console.error('Unable to initialize WebGL. Your browser or machine may not support it.');
                    return;
                }
                
                const shaderProgram = initShaderProgram(gl, this.config.shaderSource.vs, this.config.shaderSource.fs);
                const shader = {
                    program: shaderProgram,
                    attribLocations: {
                        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                        textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord')
                    },
                    uniformLocations: {
                        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
                        uSampler: gl.getUniformLocation(shaderProgram, 'uSampler')
                    }
                }
                
                const buffer = {
                    positions: gl.createBuffer(),
                    texCoords: gl.createBuffer(),
                    indices: gl.createBuffer()
                };
                   
                initWebGL(canvas, gl, shader);                
                
                this.handle.gl = gl;
                this.handle.canvas = canvas;
                this.handle.shader = shader;
                this.handle.buffer = buffer;
                
            }

        };
        

        // Core classes

        function WESASpriteSheet(desc) {
            this.ssid = desc.ssid;
            this.rowCount = desc.rowCount;
            this.colCount = desc.colCount;
            this.cellWidth = desc.cellWidth;
            this.cellHeight = desc.cellHeight;
            this.texture = null;
        }
        
        WESASpriteSheet.prototype.loadTextureFromImage = function (gl, image) {
            this.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        };
        
        WESASpriteSheet.prototype.getCellCount = function () {
            return this.rowCount * this.colCount;
        };
        
        WESASpriteSheet.prototype.getTextureClipByIndex = function (index) {
            var clip = {};
            var clipCellW = 1.0 / this.colCount;
            var clipCellH = 1.0 / this.rowCount;
            clip.x1 = clipCellW * (index % this.colCount);
            clip.x2 = clip.x1 + clipCellW * cellCount;
            clip.y1 = clipCellH * Math.floor(index / this.colCount);
            clip.y2 = clip.y1 + clipCellH;
            return clip;
        };
        
        WESASpriteSheet.prototype.getTextureClipByPosition = function (row, col, rowSpan = 1, colSpan = 1) {
            var clip = {};
            var clipCellW = 1.0 / this.colCount;
            var clipCellH = 1.0 / this.rowCount;
            clip.x1 = clipCellW * col;
            clip.x2 = clip.x1 + clipCellW * colSpan;
            clip.y1 = clipCellH * row;
            clip.y2 = clip.y1 + clipCellH * rowSpan;
            return clip;
        };
        
        
        function WESAFrame(desc) {
            this.spriteSheet = desc.spriteSheet;
            this.cell = {
                row: desc.cell.row,
                col: desc.cell.col,
                rowSpan: desc.cell.rowSpan,
                colSpan: desc.cell.colSpan
            };
            this.center = {
                x: desc.center.x,
                y: desc.center.y
            };
            this.collision = {
                hit: null,
                hurt: null
            }
            this.width = desc.spriteSheet.cellWidth * desc.cell.rowSpan;
            this.height = desc.spriteSheet.cellHeight * desc.cell.colSpan;
        }
        
        
        function WESAAnimation(desc) {
            this.name = desc.name;
            this.next = desc.next;
            this.frameList = [];
            this.endTimeList = [];
        }
        
        WESAAnimation.prototype.setFrames = function (frameArr, frameTimeArr) {
            var len = frameArr.length;
            var time = 0;
            this.frameList = frameArr.slice();
            for (var i = 0; i < len; i++) {
                time += frameTimeArr[i];
                this.endTimeList[i] = time;
            }
        };

        
        function WESAObject(desc) {
            this.oid = desc.oid;
            this.type = desc.type;
            this.name = desc.name;
            this.animList = [];
        }
        
        WESAObject.prototype.addAnimation = function (slot, anim) {
            this.animList[slot] = anim;
        };
        
        WESAObject.prototype.addAnimationByArray = function (animArr) {
            this.animList = animArr.slice();
        };

        
        function WESASprite(desc) {
            this.object = desc.object;
            this.action = desc.action;
            this.team = desc.team;
            this.position = { x: desc.position.x, y: desc.position.y };
            this.scale = desc.scale;
            this.ai = null;
            this.velocity = { x: 0, y: 0 };
            this.acceleration = { x: 0, y: 0 };
            this.scene = null;
            this.frameNum = 0;
            this.state = 0;
            this.time = 0;
            this.deadFlag = false;
            this.collision = {
                mode: WESASprite.CollisionMode.BY_SPRITE,
                hit: null,
                hurt: null
            };
        }
        
        WESASprite.CollisionMode = Object.freeze({
            BY_SPRITE: 'BY_SPRITE',
            BY_FRAME: 'BY_FRAME'
        });
        
        WESASprite.CollisionShape = Object.freeze({
            CIRCLE: 'CIRCLE',
            RECT: 'RECT'
        });
        
        WESASprite.prototype.getCurrentFrame = function () {
            return this.object.animList[this.action].frameList[this.frameNum];
        };
        
        WESASprite.prototype.changeAction = function (newAction) {
            this.action = newAction;
            this.time = 0;
            this.frameNum = 0;
        };
        
        WESASprite.prototype.setAI = function (ai) {
            ai.self = this;
            this.ai = ai;
        };
        
        WESASprite.prototype.addAI = function (aiExecuteFunction) {
            var ai = new WESAAI();
            ai.execute = aiExecuteFunction;
            ai.self = this;
            this.ai = ai;
        }
       
        WESASprite.prototype.update = function () {
            if (this.ai) {
                if (typeof this.ai.execute == 'function') {
                    this.ai.execute();
                }
            }
            var anim = this.object.animList[this.action];
            var animFrameCount = anim.frameList.length;
            this.time++;
            if (this.time >= anim.endTimeList[this.frameNum]) {
                this.frameNum++;
                if (this.time >= anim.endTimeList[animFrameCount - 1]) {
                    this.time = 0;
                }
                if (this.frameNum >= animFrameCount) {
                    this.frameNum = 0;
                    if (anim.next != null) {
                        if (anim.next != this.action) {
                            this.changeAction(anim.next);
                        }
                    }
                    else {
                        this.deadFlag = true;
                    }
                }
            }
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
            this.velocity.x += this.acceleration.x;
            this.velocity.y += this.acceleration.y;
        };
        
        
        function WESAAI() {
            this.self = null;
            this.target = null;
            this.execute = null;
        }
        
        
        function WESALayer(desc) {
            this.lid = desc.lid;
            this.spriteList = [];
            this.batchData = null;
        }

        WESALayer.prototype.addSprite = function (sprite) {
            this.spriteList.push(sprite);
        };
        
        WESALayer.prototype.update = function () {
            var sList = this.spriteList;
            for (var i = 0; i < sList.length; i++) {
                if (!sList[i].deadFlag) {
                    sList[i].update();
                }
            }
            for (var i = sList.length - 1; i >= 0; i--) {
                if (sList[i].deadFlag) {
                    sList.splice(i, 1);
                }
            }
        };
        
        WESALayer.prototype.render = function (gl, shader, buffer) {
            
            // Prepare sprite batches in current layer
            this.batchData = [];
            for (var i = 0; i < this.spriteList.length; i++) {
                if (this.spriteList[i]) {
                    var sprite = this.spriteList[i];
                    var frame = sprite.getCurrentFrame();
                    var x1 = sprite.position.x - frame.center.x * sprite.scale;
                    var x2 = x1 + frame.width * sprite.scale;
                    var y1 = sprite.position.y - frame.center.y * sprite.scale;
                    var y2 = y1 + frame.height * sprite.scale;
                    var ssid = frame.spriteSheet.ssid;
                    var texClip = frame.spriteSheet.getTextureClipByPosition(frame.cell.row, frame.cell.col, frame.cell.rowSpan, frame.cell.colSpan);
                    if (this.batchData[ssid]) {
                        this.batchData[ssid].spriteCount++;
                        var indicesBase = 4 * (this.batchData[ssid].spriteCount - 1);
                        this.batchData[ssid].positions.push(x1, y1, x2, y1, x1, y2, x2, y2);
                        this.batchData[ssid].texCoords.push(texClip.x1, texClip.y2, texClip.x2, texClip.y2, texClip.x1, texClip.y1, texClip.x2, texClip.y1);
                        this.batchData[ssid].indices.push(indicesBase, indicesBase + 1, indicesBase + 2, indicesBase + 1, indicesBase + 2, indicesBase + 3);
                    }
                    else {
                        this.batchData[ssid] = {
                            spriteCount: 1,
                            positions: [x1, y1, x2, y1, x1, y2, x2, y2],
                            texCoords: [texClip.x1, texClip.y2, texClip.x2, texClip.y2, texClip.x1, texClip.y1, texClip.x2, texClip.y1],
                            indices: [0, 1, 2, 1, 2, 3]
                        }
                    }
                }
            }
            
            // Batch-render current layer
            for (var ssid = 0; ssid < this.batchData.length; ssid++) {
                if (this.batchData[ssid]) { 
                    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.positions);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.batchData[ssid].positions), gl.STATIC_DRAW);
                    gl.vertexAttribPointer(shader.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
                    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.texCoords);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.batchData[ssid].texCoords), gl.STATIC_DRAW);
                    gl.vertexAttribPointer(shader.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indices);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.batchData[ssid].indices), gl.STATIC_DRAW);
                    gl.bindTexture(gl.TEXTURE_2D, wesaResource.spriteSheetList[ssid].texture);
                    gl.drawElements(gl.TRIANGLES, this.batchData[ssid].indices.length, gl.UNSIGNED_SHORT, 0);
                }
            }
            
        };
        
        
        function WESAScene(name) {
            this.name = name;
            this.layerList = [];
        }

        WESAScene.prototype.addSpriteToLayer = function (layerIndex, sprite, action = 0) {
            if (!this.layerList[layerIndex]) {
                var layer = new WESALayer({ lid: layerIndex });
                this.layerList[layerIndex] = layer;
            }
            this.layerList[layerIndex].addSprite(sprite);
            sprite.layer = this.layerList[layerIndex];
            sprite.scene = this;
            sprite.action = action;
        };
        
        WESAScene.prototype.getCollisions = function (layerIndexes = null) {
            var listOfSpriteList = [];
            if (layerIndexes) {
                for (var i = 0; i < layerIndexes.length; i++) {
                    if (this.layerList[layerIndexes[i]]) {
                        listOfSpriteList.push(this.layerList[layerIndexes[i]].spriteList);
                    }
                }
            }
            else {
                for (var i = 0; i < this.layerList.length; i++) {
                    if (this.layerList[i]) {
                        listOfSpriteList.push(this.layerList[i].spriteList);
                    }
                }
            }
            var allSprites = [].concat.apply([], listOfSpriteList);
            var collisions = [];
            for (var i = 0; i < allSprites.length; i++) {
                for (var j = 0; j < allSprites.length; j++) {
                    if (i == j) { continue; }
                    var si = allSprites[i], sj = allSprites[j];
                    if (si.collision && sj.collision) {
                        var iHitbox = {}, jHurtbox = {};
                        if (si.collision.mode == WESASprite.CollisionMode.BY_SPRITE) {
                            var hit = si.collision.hit;
                            if (!hit) { continue; }
                            iHitbox.shape = hit.shape;
                            if (iHitbox.shape == WESASprite.CollisionShape.CIRCLE) {
                                iHitbox.center = { x: si.position.x + hit.centerOffset.x, y: si.position.y + hit.centerOffset.y };
                                iHitbox.radius = hit.radius;
                            }
                            else if (iHitbox.mode == WESASprite.CollisionShape.RECT) {
                                iHitbox.x1 = si.position.x + hit.x1;
                                iHitbox.x2 = si.position.x + hit.x2;
                                iHitbox.y1 = si.position.y + hit.y1;
                                iHitbox.y2 = si.position.y + hit.y2;
                            }
                        }
                        else if (si.collision.mode == WESASprite.CollisionMode.BY_FRAME) {
                            // TODO
                        }
                        if (sj.collision.mode == WESASprite.CollisionMode.BY_SPRITE) {
                            var hurt = sj.collision.hurt;
                            if (!hurt) { continue; }
                            jHurtbox.shape = hurt.shape;
                            if (jHurtbox.shape == WESASprite.CollisionShape.CIRCLE) {
                                jHurtbox.center = { x: sj.position.x + hurt.centerOffset.x, y: sj.position.y + hurt.centerOffset.y };
                                jHurtbox.radius = hurt.radius;
                            }
                            else if (jHurtbox.mode == WESASprite.CollisionShape.RECT) {
                                jHurtbox.x1 = sj.position.x + hurt.x1;
                                jHurtbox.x2 = sj.position.x + hurt.x2;
                                jHurtbox.y1 = sj.position.y + hurt.y1;
                                jHurtbox.y2 = sj.position.y + hurt.y2;
                            }
                        }
                        else if (sj.collision.mode == WESASprite.CollisionMode.BY_FRAME) {
                            // TODO
                        }
                        if (iHitbox.shape == WESASprite.CollisionShape.CIRCLE && jHurtbox.shape == WESASprite.CollisionShape.CIRCLE) {
                            var dx = iHitbox.center.x - jHurtbox.center.x, dy = iHitbox.center.y - jHurtbox.center.y;
                            var dist = Math.sqrt(dx * dx + dy * dy);
                            if (iHitbox.radius + jHurtbox.radius > dist) {
                                collisions.push({
                                    hiter: si,
                                    hurter: sj
                                });
                            }
                        }
                        else if (iHitbox.shape == WESASprite.CollisionShape.RECT && jHurtbox.shape == WESASprite.CollisionShape.RECT) {
                            // TODO
                        }
                    } 
                }
            }
            return collisions;
        };
        
        WESAScene.prototype.update = function () {
            for (var i = 0; i < this.layerList.length; i++) {
                if (this.layerList[i]) {
                    this.layerList[i].update();
                }
            }
        };
        
        WESAScene.prototype.render = function () {
            var gl = wesaCore.handle.gl;
            var shader = wesaCore.handle.shader;
            var buffer = wesaCore.handle.buffer;
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            for (var i = 0; i < this.layerList.length; i++) {
                if (this.layerList[i]) {
                    this.layerList[i].render(gl, shader, buffer);
                }
            }
        };
        
        
        return {
            
            // Classes
            SpriteSheet: WESASpriteSheet,
            Frame: WESAFrame,
            Animation: WESAAnimation,
            StoredObject: WESAObject,
            Sprite: WESASprite,
            AI: WESAAI,
            Scene: WESAScene,
            
            // Objects
            core: wesaCore,
            res: wesaResource,
            loader: wesaLoader

        };
        
    }
    
    if (typeof(window.wesa) === 'undefined'){
        window.wesa = WESACore();
    }
    
})(window);