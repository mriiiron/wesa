(function (window) {
    'use strict'

    function WESACore() {

        // Private functions and types

        const m4 = {

            fromTranslation: function (v) {
                let out = new Float32Array(16);
                out[0] = 1;
                out[1] = 0;
                out[2] = 0;
                out[3] = 0;
                out[4] = 0;
                out[5] = 1;
                out[6] = 0;
                out[7] = 0;
                out[8] = 0;
                out[9] = 0;
                out[10] = 1;
                out[11] = 0;
                out[12] = v[0];
                out[13] = v[1];
                out[14] = v[2];
                out[15] = 1;
                return out;
            },

            ortho: function (left, right, bottom, top, near, far) {
                let out = new Float32Array(16);
                let lr = 1 / (left - right);
                let bt = 1 / (bottom - top);
                let nf = 1 / (near - far);
                out[0] = -2 * lr;
                out[1] = 0;
                out[2] = 0;
                out[3] = 0;
                out[4] = 0;
                out[5] = -2 * bt;
                out[6] = 0;
                out[7] = 0;
                out[8] = 0;
                out[9] = 0;
                out[10] = 2 * nf;
                out[11] = 0;
                out[12] = (left + right) * lr;
                out[13] = (top + bottom) * bt;
                out[14] = (far + near) * nf;
                out[15] = 1;
                return out;
            }

        };

        function loadShader(gl, type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('WESA Core: An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
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
                console.error('WESA Core: Unable to initialize the shader program: ' + gl.getshaderProgramInfoLog(shaderProgram));
                return null;
            }
            return shaderProgram;
        }

        function initWebGL(gl, shader) {

            // Set clearing options
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clearDepth(1.0);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            // Tell WebGL to use our program when drawing
            gl.useProgram(shader.program);

            // Set the initial projection matrix:
            // Create a orthogonal projection matrix for 480x640 viewport
            let left = -gl.canvas.width / 2;
            let right = gl.canvas.width / 2;
            let bottom = -gl.canvas.height / 2;
            let top = gl.canvas.height / 2;
            let zNear = 0.1;
            let zFar = 100.0;
            let projectionMatrix = m4.ortho(left, right, bottom, top, zNear, zFar);
            gl.uniformMatrix4fv(shader.uniformLocations.projectionMatrix, false, projectionMatrix);

            // Set the initial model view matrix:
            let modelViewMatrix = m4.fromTranslation([0.0, 0.0, -6.0]);
            gl.uniformMatrix4fv(shader.uniformLocations.modelViewMatrix, false, modelViewMatrix);

            // Tell WebGL we want to affect texture unit 0 and bound the texture to texture unit 0 (gl.TEXTURE0)
            gl.activeTexture(gl.TEXTURE0);
            gl.uniform1i(shader.uniformLocations.uSampler, 0);

            // Turn on attribute array
            gl.enableVertexAttribArray(shader.attribLocations.vertexPosition);
            gl.enableVertexAttribArray(shader.attribLocations.textureCoord);

        }

        // END Private content


        // "wesa.assets" object

        const wesaAssets = {

            source: {
                spriteSheetUrlArray: [],
                objectJsonUrl: null
            },

            spriteSheets: [],
            storedObjects: [],

            load: function (callback) {

                let me = this;

                if (me.source.spriteSheetUrlArray.length == 0) {
                    console.error('WESA Loader: No sprite sheet added.');
                    return;
                }
                if (!me.source.objectJsonUrl) {
                    console.error('WESA Loader: No object added.');
                    return;
                }

                let loadedImageCount = 0;
                let isObjectsLoaded = false;

                var loadedImages = [];
                var loadedObjectJson = null;

                let imageUrls = me.source.spriteSheetUrlArray;

                function onAssetLoaded(type) {
                    if (type == 'image') {
                        loadedImageCount++;
                    }
                    else if (type = 'object') {
                        isObjectsLoaded = true;
                    }
                    if (loadedImageCount == imageUrls.length && isObjectsLoaded) {

                        let parsed = JSON.parse(loadedObjectJson);

                        // Load Sprite Sheets
                        for (let i = 0; i < parsed.spriteSheetsMeta.length; i++) {
                            let ssMeta = parsed.spriteSheetsMeta[i];
                            let ss = new WESASpriteSheet({
                                ssid: ssMeta.id,
                                rowCount: ssMeta.rowCount,
                                colCount: ssMeta.colCount,
                                cellWidth: ssMeta.cellWidth,
                                cellHeight: ssMeta.cellHeight
                            });
                            ss.loadTextureFromImage(wesaCore.handle.gl, loadedImages[i]);
                            me.spriteSheets.push(ss);
                        }

                        // Load Objects
                        for (let i = 0; i < parsed.objects.length; i++) {
                            let o = parsed.objects[i];
                            let obj = new WESAStoredObject({
                                oid: o.id,
                                type: o.type,
                                name: o.name
                            });


                            if (o.hasOwnProperty('inherits')) {
                                let parent = me.storedObjects[o.inherits];
                                if (parent) {
                                    if (parent.frameLib) {
                                        obj.frameLib = parent.frameLib.slice();
                                    }
                                    if (parent.animations) {
                                        obj.animations = parent.animations.slice();
                                    }
                                }
                                else {
                                    console.warn('wesaAssets.load(): Object "' + o.name + '" is inheriting from an undefined object.');
                                }
                            }


                            if (o.frames) {
                                obj.frameLib = [];
                                for (let j = 0; j < o.frames.length; j++) {
                                    let f = o.frames[j];
                                    if (f.loadMode == 'array') {
                                        for (let i = 0; i < f.cells.rowCount * f.cells.colCount; i++) {
                                            let fid = f.idStart + i;
                                            if (obj.frameLib[fid]) {
                                                console.error('wesaAssets.load(): WESAFrame conflicts on WESAStoredObject "' + obj.name + '". Frame #"' + fid + '".');
                                            }
                                            else {
                                                let row = f.cells.rowStart + Math.floor(i / f.cells.colCount);
                                                let col = f.cells.colStart + i % f.cells.colCount;
                                                obj.frameLib[fid] = new WESAFrame({
                                                    spriteSheet: me.spriteSheets[f.spriteSheet],
                                                    cell: { row: row, col: col, rowSpan: 1, colSpan: 1 },
                                                    center: { x: f.center.x, y: f.center.y }
                                                });
                                            }
                                        }
                                    }
                                    else if (f.loadMode == 'single') {
                                        if (obj.frameLib[f.id]) {
                                            console.error('wesaAssets.load(): WESAFrame conflicts on WESAStoredObject "' + obj.name + '". Frame #"' + f.id + '".');
                                        }
                                        else {
                                            obj.frameLib[f.id] = new WESAFrame({
                                                spriteSheet: me.spriteSheets[f.spriteSheet],
                                                cell: { row: f.cell.row, col: f.cell.col, rowSpan: f.cell.rowSpan, colSpan: f.cell.colSpan },
                                                center: { x: f.center.x, y: f.center.y }
                                            });
                                        }
                                    }
                                    else {
                                        console.error('wesaAssets.load(): Missing frame loading mode when loading frames for "' + obj.name + '". Got "' + f.loadMode + '".');
                                    }
                                }
                            }

                            if (o.animations) {
                                obj.animations = [];
                                for (let j = 0; j < o.animations.length; j++) {
                                    let a = o.animations[j];
                                    let anim = new WESAAnimation({
                                        aid: a.id,
                                        name: a.name,
                                        next: a.hasOwnProperty('next') ? a.next : a.id
                                    });
                                    if (a.hasOwnProperty('collision')) {
                                        anim.collision.hit = a.collision.hasOwnProperty('hit') ? a.collision.hit : null;
                                        anim.collision.hurt = a.collision.hasOwnProperty('hurt') ? a.collision.hurt : null;
                                    }
                                    else if (o.hasOwnProperty('defaultCollision')) {
                                        anim.collision.hit = o.defaultCollision.hasOwnProperty('hit') ? o.defaultCollision.hit : null;
                                        anim.collision.hurt = o.defaultCollision.hasOwnProperty('hurt') ? o.defaultCollision.hurt : null;
                                    }
                                    anim.setFrames(a.frameList.slice(), a.frameTimeList.slice());
                                    obj.addAnimation(a.id, anim);
                                }
                            }

                            me.storedObjects[o.id] = obj;
                        }
                        callback();
                    }
                }

                for (let i = 0; i < imageUrls.length; i++) {
                    loadedImages[i] = new Image();
                    loadedImages[i].src = imageUrls[i];
                    loadedImages[i].onload = function () {
                        onAssetLoaded('image');
                    }
                    loadedImages[i].onerror = function () {
                        console.warning('WESA Loader: Image "' + urlArray[i] + '" load failed.');
                        onAssetLoaded('image');
                    }
                }

                let r = new XMLHttpRequest();
                r.open('GET', this.source.objectJsonUrl)
                r.onload = function () {
                    if (r.status >= 200 && r.status < 400) {
                        loadedObjectJson = r.responseText;
                        onAssetLoaded('object');
                    }
                    else {
                        console.error('WESA Loader: Cannot load JSON "' + this.source.objectJsonUrl + '".');
                    }
                }
                r.onerror = function () {
                    console.error('WESA Loader: Cannot load JSON "' + this.source.objectJsonUrl + '" (connection error).');
                }
                r.send();

            }

        }


        // "wesa.stat" objects

        const wesaStat = {
            fps: 0,
            collisionChecks: 0,
            collisionsDetected: 0,
            paused: false
        }


        // "wesa.core" object

        const wesaCore = {

            handle: {
                gl: null,
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

            canvasResize: function() {
                let gl = this.handle.gl;
                let shader = this.handle.shader;
                let left = -gl.canvas.width / 2;
                let right = gl.canvas.width / 2;
                let bottom = -gl.canvas.height / 2;
                let top = gl.canvas.height / 2;
                let zNear = 0.1;
                let zFar = 100.0;
                let projectionMatrix = m4.ortho(left, right, bottom, top, zNear, zFar);
                gl.uniformMatrix4fv(shader.uniformLocations.projectionMatrix, false, projectionMatrix);
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            },

            init: function (canvas) {
                if (!canvas || canvas.tagName != 'CANVAS') {
                    console.error('WESA Core: Canvas provided is invalid.');
                    return;
                }
                const gl = canvas.getContext("webgl");
                if (!gl) {
                    console.error('WESA Core: Unable to initialize WebGL. Your browser or machine may not support it.');
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
                initWebGL(gl, shader);
                this.handle.gl = gl;
                this.handle.shader = shader;
                this.handle.buffer = buffer;
            },

            pause: function () {
                wesaStat.paused = !wesaStat.paused;
            }

        };


        // wesa.camera objects

        const wesaCamera = {
            position: {
                x: 0,
                y: 0
            },
            zoom: 1
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
            this.width = desc.spriteSheet.cellWidth * desc.cell.colSpan;
            this.height = desc.spriteSheet.cellHeight * desc.cell.rowSpan;
        }


        function WESAAnimation(desc) {
            this.aid = desc.aid
            this.name = desc.name;
            this.next = desc.next;
            this.frameList = [];
            this.endTimeList = [];
            this.collision = {
                hit: null,
                hurt: null
            };
        }

        WESAAnimation.prototype.setFrames = function (frameArr, frameTimeArr) {
            var len = frameArr.length;
            var time = 0;
            this.frameList = frameArr;
            for (let i = 0; i < len; i++) {
                time += frameTimeArr[i];
                this.endTimeList[i] = time;
            }
        };


        function WESAStoredObject(desc) {
            this.oid = desc.oid;
            this.type = desc.type;
            this.name = desc.name;
            this.frameLib = null;
            this.animations = null;
        }

        WESAStoredObject.prototype.addAnimation = function (slot, anim) {
            this.animations[slot] = anim;
        };

        WESAStoredObject.prototype.addAnimationByArray = function (animArr) {
            this.animations = animArr.slice();
        };


        function WESASprite(desc) {
            this.object = desc.object;
            this.action = desc.action;
            this.team = (desc.team === undefined ? 0 : desc.team);
            this.position = { x: desc.position.x, y: desc.position.y };
            this.scale = (typeof(desc.scale) == "number" ? { x: desc.scale, y: desc.scale } : { x: desc.scale.x, y: desc.scale.y });
            this.prevPosition = { x: 0, y: 0 };
            this.aiList = [];
            this.velocity = { x: 0, y: 0 };
            this.acceleration = { x: 0, y: 0 };
            this.scene = null;
            this.frameNum = 0;
            this.state = 0;
            this.time = 0;
            this.deadFlag = false;
            this.delayedActionChange = null;
            this.collision = {
                mode: WESASprite.CollisionMode.BY_SPRITE,
                hit: null,
                hurt: null
            };
            this.flags = {
                platformCollisionCheck: false
            };
            this.platform = null;
        }

        WESASprite.CollisionMode = Object.freeze({
            BY_SPRITE: 'BY_SPRITE',
            BY_ANIMATION: 'BY_ANIMATION',
            BY_FRAME: 'BY_FRAME'
        });

        WESASprite.CollisionShape = Object.freeze({
            CIRCLE: 'CIRCLE',
            RECT: 'RECT'
        });

        WESASprite.prototype.getCurrentAnim = function () {
            return this.object.animations[this.action];
        };

        WESASprite.prototype.getCurrentFrame = function () {
            return this.object.frameLib[this.getCurrentAnim().frameList[this.frameNum]];
        };

        WESASprite.prototype.changeAction = function (newAction, options) {
            if (options.isSmart && this.action == newAction) { return; }
            if (options.isImmediate) {
                this.action = newAction;
                this.time = 0;
                this.frameNum = 0;
            }
            else {
                this.delayedActionChange = newAction;
            }
        };

        WESASprite.prototype.setTime = function (time) {
            let endTimeList = this.object.animations[this.action].endTimeList;
            let max = endTimeList[endTimeList.length - 1];
            if (time < 0) { time = 0; }
            if (time >= max) { time = max - 1; }
            this.time = time;
            for (let i = 0; i < endTimeList.length; i++) {
                if (time < endTimeList[i]) {
                    this.frameNum = i;
                    break;
                }
            }
        };

        WESASprite.prototype.addAI = function (ai) {
            ai.self = this;
            this.aiList.push(ai);
        };

        WESASprite.prototype.kill = function () {
            this.deadFlag = true;
        };

        WESASprite.prototype.update = function () {
            for (let i = 0; i < this.aiList.length; i++) {
                this.aiList[i].execute();
            }
            let anim = this.object.animations[this.action];
            if (!anim) {
                console.error('WESASprite: No animation for action #' + this.action + '. Object: "' + this.object.name + '"');
                return;
            }
            let animFrameCount = anim.frameList.length;
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
                            this.changeAction(anim.next, {
                                isSmart: false,
                                isImmediate: true
                            });
                        }
                    }
                    else {
                        this.kill();
                    }
                }
            }
            this.prevPosition.x = this.position.x;
            this.prevPosition.y = this.position.y;
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
            this.velocity.x += this.acceleration.x;
            this.velocity.y += this.acceleration.y;
            if (this.delayedActionChange) {
                this.changeAction(this.delayedActionChange, {
                    isSmart: false,
                    isImmediate: true
                });
                this.delayedActionChange = null;
            }
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
            let sList = this.spriteList;
            for (let i = 0; i < sList.length; i++) {
                if (!sList[i].deadFlag) {
                    sList[i].update();
                }
            }
            for (let i = sList.length - 1; i >= 0; i--) {
                if (sList[i].deadFlag) {
                    sList.splice(i, 1);
                }
            }
        };

        WESALayer.prototype.render = function (gl, shader, buffer) {

            // Prepare sprite batches in current layer
            this.batchData = [];
            for (let i = 0; i < this.spriteList.length; i++) {
                if (this.spriteList[i]) {
                    let sprite = this.spriteList[i];
                    let frame = sprite.getCurrentFrame();
                    if (frame) {
                        let ssid = frame.spriteSheet.ssid;
                        let x1, x2, y1, y2, texClip;
                        if (sprite instanceof WESASprite) {
                            x1 = sprite.position.x - frame.center.x * sprite.scale.x;
                            x2 = x1 + frame.width * sprite.scale.x;
                            y1 = sprite.position.y - frame.center.y * sprite.scale.y;
                            y2 = y1 + frame.height * sprite.scale.y;
                            texClip = frame.spriteSheet.getTextureClipByPosition(frame.cell.row, frame.cell.col, frame.cell.rowSpan, frame.cell.colSpan);
                        }
                        else {
                            console.error('WESALayer: An error occurred when rendering: Unknown sprite type: ' + sprite.constructor.name);
                            return;
                        }
                        if (this.batchData[ssid]) {
                            this.batchData[ssid].spriteCount++;
                            let indicesBase = 4 * (this.batchData[ssid].spriteCount - 1);
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
            }

            // Batch-render current layer
            for (let ssid = 0; ssid < this.batchData.length; ssid++) {
                if (this.batchData[ssid]) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.positions);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.batchData[ssid].positions), gl.STATIC_DRAW);
                    gl.vertexAttribPointer(shader.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
                    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.texCoords);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.batchData[ssid].texCoords), gl.STATIC_DRAW);
                    gl.vertexAttribPointer(shader.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indices);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.batchData[ssid].indices), gl.STATIC_DRAW);
                    gl.bindTexture(gl.TEXTURE_2D, wesaAssets.spriteSheets[ssid].texture);
                    gl.drawElements(gl.TRIANGLES, this.batchData[ssid].indices.length, gl.UNSIGNED_SHORT, 0);
                }
            }

        };


        function WESAScene(name) {
            this.name = name;
            this.layerList = [];
            this.platformList = [];
        }

        WESAScene.prototype.addSpriteToLayer = function (layerIndex, sprite) {
            if (!this.layerList[layerIndex]) {
                var layer = new WESALayer({ lid: layerIndex });
                this.layerList[layerIndex] = layer;
            }
            this.layerList[layerIndex].addSprite(sprite);
            sprite.layer = this.layerList[layerIndex];
            sprite.scene = this;
        };

        WESAScene.prototype.clear = function () {
            this.layerList = [];
        };

        WESAScene.prototype.getCollisions = function (options) {
            let listOfSpriteList = [];
            if (options.layerIndexes && Array.isArray(options.layerIndexes)) {
                for (let i = 0; i < layerIndexes.length; i++) {
                    if (this.layerList[layerIndexes[i]]) {
                        listOfSpriteList.push(this.layerList[layerIndexes[i]].spriteList);
                    }
                }
            }
            else {
                for (let i = 0; i < this.layerList.length; i++) {
                    if (this.layerList[i]) {
                        listOfSpriteList.push(this.layerList[i].spriteList);
                    }
                }
            }
            let allSprites = [].concat.apply([], listOfSpriteList);
            let collisions = [], count = 0;
            for (let i = 0; i < allSprites.length; i++) {
                for (let j = 0; j < allSprites.length; j++) {
                    if (i == j) { continue; }
                    let si = allSprites[i], sj = allSprites[j];
                    if (options.collisionMatrix && !options.collisionMatrix[si.object.type][sj.object.type]) { continue; }
                    let hit, hurt;
                    if (si.collision.mode == WESASprite.CollisionMode.BY_SPRITE) {
                        hit = si.collision.hit;
                    }
                    else if (si.collision.mode == WESASprite.CollisionMode.BY_ANIMATION) {
                        hit = si.getCurrentAnim().collision.hit;
                    }
                    else if (si.collision.mode == WESASprite.CollisionMode.BY_FRAME) {
                        // TODO
                    }
                    if (sj.collision.mode == WESASprite.CollisionMode.BY_SPRITE) {
                        hurt = sj.collision.hurt;
                    }
                    else if (sj.collision.mode == WESASprite.CollisionMode.BY_ANIMATION) {
                        hurt = sj.getCurrentAnim().collision.hurt;
                    }
                    else if (sj.collision.mode == WESASprite.CollisionMode.BY_FRAME) {
                        // TODO
                    }
                    if (hit && hurt) {
                        let iHitbox = { shape: hit.shape }, jHurtbox = { shape: hurt.shape };
                        if (iHitbox.shape == WESASprite.CollisionShape.CIRCLE) {
                            iHitbox.center = { x: si.position.x + hit.centerRelative.x, y: si.position.y + hit.centerRelative.y };
                            iHitbox.radius = hit.radius;
                        }
                        else if (iHitbox.shape == WESASprite.CollisionShape.RECT) {
                            iHitbox.x1 = si.position.x + hit.x1Relative;
                            iHitbox.x2 = si.position.x + hit.x2Relative;
                            iHitbox.y1 = si.position.y + hit.y1Relative;
                            iHitbox.y2 = si.position.y + hit.y2Relative;
                        }
                        if (jHurtbox.shape == WESASprite.CollisionShape.CIRCLE) {
                            jHurtbox.center = { x: sj.position.x + hurt.centerRelative.x, y: sj.position.y + hurt.centerRelative.y };
                            jHurtbox.radius = hurt.radius;
                        }
                        else if (jHurtbox.shape == WESASprite.CollisionShape.RECT) {
                            jHurtbox.x1 = sj.position.x + hurt.x1Relative;
                            jHurtbox.x2 = sj.position.x + hurt.x2Relative;
                            jHurtbox.y1 = sj.position.y + hurt.y1Relative;
                            jHurtbox.y2 = sj.position.y + hurt.y2Relative;
                        }
                        if (iHitbox.shape == WESASprite.CollisionShape.CIRCLE && jHurtbox.shape == WESASprite.CollisionShape.CIRCLE) {
                            let x1 = iHitbox.center.x, x2 = jHurtbox.center.x;
                            let y1 = iHitbox.center.y, y2 = jHurtbox.center.y;
                            let dx = x1 - x2, dy = y1 - y2;
                            let d = Math.sqrt(dx * dx + dy * dy);
                            let r1 = iHitbox.radius, r2 = jHurtbox.radius;
                            if (r1 + r2 > d) {
                                collisions.push({
                                    hitter: si,
                                    hurter: sj,
                                    collisionPoint: { x: (r2 * r2 * x1 + r1 * r1 * x2) / (r1 * r1 + r2 * r2), y: (r2 * r2 * y1 + r1 * r1 * y2) / (r1 * r1 + r2 * r2)}
                                });
                            }
                        }
                        else if (iHitbox.shape == WESASprite.CollisionShape.CIRCLE && jHurtbox.shape == WESASprite.CollisionShape.RECT) {
                            let dx = 0, dy = 0;
                            let px, py;
                            if (iHitbox.center.x < jHurtbox.x1) {
                                dx = jHurtbox.x1 - iHitbox.center.x;
                                px = jHurtbox.x1;
                            }
                            else if (iHitbox.center.x > jHurtbox.x2) {
                                dx = iHitbox.center.x - jHurtbox.x2;
                                px = jHurtbox.x2;
                            }
                            else {
                                px = iHitbox.center.x;
                            }
                            if (iHitbox.center.y < jHurtbox.y1) {
                                dy = jHurtbox.y1 - iHitbox.center.y;
                                py = jHurtbox.y1;
                            }
                            else if (iHitbox.center.y > jHurtbox.y2) {
                                dy = iHitbox.center.y - jHurtbox.y2;
                                py = jHurtbox.y2
                            }
                            else {
                                py = iHitbox.center.y;
                            }
                            let d = Math.sqrt(dx * dx + dy * dy);
                            if (iHitbox.radius > d) {
                                collisions.push({
                                    hitter: si,
                                    hurter: sj,
                                    collisionPoint: { x: px, y: py }
                                });
                            }
                        }
                        else if (iHitbox.shape == WESASprite.CollisionShape.RECT && jHurtbox.shape == WESASprite.CollisionShape.CIRCLE) {
                            // TODO
                        }
                        else if (iHitbox.shape == WESASprite.CollisionShape.RECT && jHurtbox.shape == WESASprite.CollisionShape.RECT) {
                            if (iHitbox.x1 <= jHurtbox.x2 && iHitbox.y1 <= jHurtbox.y2 && iHitbox.x2 >= jHurtbox.x1 && iHitbox.y2 >= jHurtbox.y1) {
                                collisions.push({
                                    hitter: si,
                                    hurter: sj,
                                    collisionPoint: { x: (iHitbox.x1 + iHitbox.x2 + jHurtbox.x1 + jHurtbox.x2) / 4, y: (iHitbox.y1 + iHitbox.y2 + jHurtbox.y1 + jHurtbox.y2) / 4 }
                                });
                            }
                        }
                        count++;
                    }
                }
            }
            wesaStat.collisionChecks = count;
            wesaStat.collisionsDetected = collisions.length;
            return collisions;
        };

        WESAScene.prototype.update = function () {
            if (wesaStat.paused) { return; }

            // Update sprites. This is handled within each layer
            for (let i = 0; i < this.layerList.length; i++) {
                if (this.layerList[i]) {
                    this.layerList[i].update();
                }
            }

            // Update platforms
            let pList = this.platformList;
            for (let i = 0; i < pList.length; i++) {
                if (!pList[i].deadFlag) {
                    pList[i].update();
                }
            }
            for (let i = pList.length - 1; i >= 0; i--) {
                if (pList[i].deadFlag) {
                    pList.splice(i, 1);
                }
            }

        };

        WESAScene.prototype.render = function () {
            let gl = wesaCore.handle.gl;
            let shader = wesaCore.handle.shader;
            let buffer = wesaCore.handle.buffer;
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.uniformMatrix4fv(shader.uniformLocations.modelViewMatrix, false, m4.fromTranslation([-wesaCamera.position.x, -wesaCamera.position.y, -6.0]));
            for (let i = 0; i < this.layerList.length; i++) {
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
            StoredObject: WESAStoredObject,
            Sprite: WESASprite,
            AI: WESAAI,
            Scene: WESAScene,

            // Objects
            core: wesaCore,
            assets: wesaAssets,
            camera: wesaCamera,
            stat: wesaStat

        };

    }

    if (typeof(window.wesa) === 'undefined'){
        window.wesa = WESACore();
    }

})(window);
