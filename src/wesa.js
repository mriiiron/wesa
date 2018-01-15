(function (window) {
    'use strict'

    function WESACore () {

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

        function setProjection(gl, shader) {
            let left = -gl.canvas.width / 2;
            let right = gl.canvas.width / 2;
            let bottom = -gl.canvas.height / 2;
            let top = gl.canvas.height / 2;
            let zNear = 0.1;
            let zFar = 100.0;
            let projectionMatrix = m4.ortho(left, right, bottom, top, zNear, zFar);
            gl.uniformMatrix4fv(shader.uniformLocations.projectionMatrix, false, projectionMatrix);
        }

        function setModelView(gl, shader) {
            let modelViewMatrix = m4.fromTranslation([0.0, 0.0, -6.0]);
            gl.uniformMatrix4fv(shader.uniformLocations.modelViewMatrix, false, modelViewMatrix);
        }

        function initWebGL(gl, shader) {

            // Set clearing options
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clearDepth(1.0);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            // Tell WebGL to use our program when drawing
            gl.useProgram(shader.program);

            // Set the projection matrix:
            // Create a orthogonal projection matrix for 480x640 viewport
            setProjection(gl, shader);

            // Set the model view matrix:
            // Under change based on camera (TODO)
            setModelView(gl, shader);

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

            spriteSheetList: [],
            objectList: [],

            load: function (callback) {

                let _self = this;

                if (_self.source.spriteSheetUrlArray.length == 0) {
                    console.error('WESA Loader: No sprite sheet added.');
                    return;
                }
                if (!_self.source.objectJsonUrl) {
                    console.error('WESA Loader: No object added.');
                    return;
                }

                let loadedImageCount = 0;
                let isObjectsLoaded = false;

                var loadedImages = [];
                var loadedObjectJson = null;

                let imageUrls = _self.source.spriteSheetUrlArray;

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
                                ssid: i,
                                rowCount: ssMeta.rowCount,
                                colCount: ssMeta.colCount,
                                cellWidth: ssMeta.cellWidth,
                                cellHeight: ssMeta.cellHeight
                            });
                            ss.loadTextureFromImage(wesaCore.handle.gl, loadedImages[i]);
                            _self.spriteSheetList.push(ss);
                        }

                        // Load Objects
                        for (let i = 0; i < parsed.objects.length; i++) {
                            let objData = parsed.objects[i];
                            let obj = new wesa.StoredObject({
                                oid: i,
                                type: objData.type,
                                name: objData.name
                            });
                            let fArr = [];
                            for (let j = 0; j < objData.frameLib.length; j++) {
                                let f = objData.frameLib[j];
                                fArr.push(new WESAFrame({
                                    spriteSheet: _self.spriteSheetList[f.spriteSheet],
                                    cell: { row: f.cell.row, col: f.cell.col, rowSpan: f.cell.rowSpan, colSpan: f.cell.colSpan },
                                    center: { x: f.center.x, y: f.center.y }
                                }));
                            }
                            for (let j = 0; j < objData.animList.length; j++) {
                                let a = objData.animList[j];
                                let anim = new WESAAnimation({
                                    aid: j,
                                    name: a.name,
                                    next: a.next
                                });
                                anim.setFrames(Array.from(a.frameList, x => (x == null ? null : fArr[x])), a.frameTimeList.slice());
                                obj.addAnimation(j, anim);
                            }
                            _self.objectList.push(obj);
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
                var gl = this.handle.gl;
                setProjection(gl, this.handle.shader);
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
            this.width = desc.spriteSheet.cellWidth * desc.cell.colSpan;
            this.height = desc.spriteSheet.cellHeight * desc.cell.rowSpan;
        }


        function WESAAnimation(desc) {
            this.aid = desc.aid
            this.name = desc.name;
            this.next = desc.next;
            this.frameList = [];
            this.endTimeList = [];
        }

        WESAAnimation.prototype.setFrames = function (frameArr, frameTimeArr) {
            var len = frameArr.length;
            var time = 0;
            this.frameList = frameArr.slice();
            for (let i = 0; i < len; i++) {
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

        WESASprite.prototype.getCurrentAnim = function () {
            return this.object.animList[this.action];
        };

        WESASprite.prototype.getCurrentFrame = function () {
            return this.object.animList[this.action].frameList[this.frameNum];
        };

        WESASprite.prototype.changeAction = function (newAction) {
            this.action = newAction;
            this.time = 0;
            this.frameNum = 0;
        };

        WESASprite.prototype.setTime = function (time) {
            let endTimeList = this.object.animList[this.action].endTimeList;
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
        }

        WESASprite.prototype.setAI = function (ai) {
            ai.self = this;
            this.ai = ai;
        };

        WESASprite.prototype.addAI = function (aiExecuteFunction) {
            let ai = new WESAAI();
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
            let anim = this.object.animList[this.action];
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


        function WESATiledSprite(desc) {
            this.object = desc.object;
            this.action = desc.action;
            this.position = { x: desc.position.x, y: desc.position.y };
            this.scale = desc.scale;
            this.width = desc.width;
            this.height = desc.height;
            this.texOffset = { x: 0.0, y: 0.0 };
            this.scene = null;
            this.frameNum = 0;
            this.time = 0;
        }

        WESATiledSprite.prototype.getCurrentAnim = function () {
            return this.object.animList[this.action];
        };

        WESATiledSprite.prototype.getCurrentFrame = function () {
            return this.object.animList[this.action].frameList[this.frameNum];
        };

        WESATiledSprite.prototype.update = function () {
            let anim = this.object.animList[this.action];
            let animFrameCount = anim.frameList.length;
            this.time++;
            if (this.time >= anim.endTimeList[this.frameNum]) {
                this.frameNum++;
                if (this.time >= anim.endTimeList[animFrameCount - 1]) {
                    this.time = 0;
                }
                if (this.frameNum >= animFrameCount) {
                    this.frameNum = 0;
                }
            }
        };


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
                            x1 = sprite.position.x - frame.center.x * sprite.scale;
                            x2 = x1 + frame.width * sprite.scale;
                            y1 = sprite.position.y - frame.center.y * sprite.scale;
                            y2 = y1 + frame.height * sprite.scale;
                            texClip = frame.spriteSheet.getTextureClipByPosition(frame.cell.row, frame.cell.col, frame.cell.rowSpan, frame.cell.colSpan);
                        }
                        else if (sprite instanceof WESATiledSprite) {
                            x1 = sprite.position.x;
                            x2 = x1 + sprite.width;
                            y1 = sprite.position.y;
                            y2 = y1 + sprite.height;
                            texClip = {
                                x1: sprite.texOffset.x,
                                y1: sprite.texOffset.y,
                                x2: sprite.texOffset.x + sprite.width / frame.width,
                                y2: sprite.texOffset.y + sprite.height / frame.height
                            };
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
                    gl.bindTexture(gl.TEXTURE_2D, wesaAssets.spriteSheetList[ssid].texture);
                    gl.drawElements(gl.TRIANGLES, this.batchData[ssid].indices.length, gl.UNSIGNED_SHORT, 0);
                }
            }

        };


        function WESAScene(name) {
            this.name = name;
            this.layerList = [];
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

        WESAScene.prototype.getCollisions = function (layerIndexes = null) {
            let listOfSpriteList = [];
            if (layerIndexes) {
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
            let collisions = [];
            for (let i = 0; i < allSprites.length; i++) {
                for (let j = 0; j < allSprites.length; j++) {
                    if (i == j) { continue; }
                    let si = allSprites[i], sj = allSprites[j];
                    if (si.collision && sj.collision) {
                        let iHitbox = {}, jHurtbox = {};
                        if (si.collision.mode == WESASprite.CollisionMode.BY_SPRITE) {
                            let hit = si.collision.hit;
                            if (!hit) { continue; }
                            iHitbox.shape = hit.shape;
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
                        }
                        else if (si.collision.mode == WESASprite.CollisionMode.BY_FRAME) {
                            // TODO
                        }
                        if (sj.collision.mode == WESASprite.CollisionMode.BY_SPRITE) {
                            let hurt = sj.collision.hurt;
                            if (!hurt) { continue; }
                            jHurtbox.shape = hurt.shape;
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
                        }
                        else if (sj.collision.mode == WESASprite.CollisionMode.BY_FRAME) {
                            // TODO
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
                            // TODO
                        }
                    }
                }
            }
            return collisions;
        };

        WESAScene.prototype.update = function () {
            for (let i = 0; i < this.layerList.length; i++) {
                if (this.layerList[i]) {
                    this.layerList[i].update();
                }
            }
        };

        WESAScene.prototype.render = function () {
            let gl = wesaCore.handle.gl;
            let shader = wesaCore.handle.shader;
            let buffer = wesaCore.handle.buffer;
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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
            StoredObject: WESAObject,
            Sprite: WESASprite,
            TiledSprite: WESATiledSprite,
            AI: WESAAI,
            Scene: WESAScene,

            // Objects
            core: wesaCore,
            assets: wesaAssets,

        };

    }

    if (typeof(window.wesa) === 'undefined'){
        window.wesa = WESACore();
    }

})(window);
