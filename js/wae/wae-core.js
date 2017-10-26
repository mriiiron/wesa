// wae-object.js

define(

    // Module Dependencies
    [],
    
    // Module Definition
    function () {
        
        var waeSpriteSheetList = [];
        var waeObjectList = [];
        
        var waeSpriteBatcher = {
            
            batchData: [],
            
            buffers: {
                positions: null,
                texCoords: null,
                indices: null
            },
            
            init: function (gl) {
                this.buffers.positions = gl.createBuffer();
                this.buffers.texCoords = gl.createBuffer();
                this.buffers.indices = gl.createBuffer();
            },
            
            addSpriteToBatch: function (sprite) {
                var frame = sprite.getCurrentFrame();
                var x1 = sprite.position.x - frame.center.x;
                var x2 = x1 + frame.width;
                var y1 = sprite.position.y - frame.center.y;
                var y2 = y1 + frame.height;
                var ssid = frame.spriteSheet.ssid;
                var texClip = frame.spriteSheet.getTextureClip(frame.cellIndex);
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
            },
            
            clear: function () {
                this.batchData = [];
            },
            
            render: function (gl, shaderProgramInfo) {      
                for (var ssid = 0; ssid < this.batchData.length; ssid++) {
                    if (this.batchData[ssid]) { 
                        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.positions);
                        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.batchData[ssid].positions), gl.STATIC_DRAW);
                        gl.vertexAttribPointer(shaderProgramInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
                        
                        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.texCoords);
                        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.batchData[ssid].texCoords), gl.STATIC_DRAW);
                        gl.vertexAttribPointer(shaderProgramInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);

                        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);
                        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.batchData[ssid].indices), gl.STATIC_DRAW);
                        
                        gl.bindTexture(gl.TEXTURE_2D, waeSpriteSheetList[ssid].texture);
                        gl.drawElements(gl.TRIANGLES, this.batchData[ssid].indices.length, gl.UNSIGNED_SHORT, 0);
                    }
                }
            }
            
        }
        

        function WAESpriteSheet(desc) {
            this.ssid = desc.ssid;
            this.rowCount = desc.rowCount;
            this.colCount = desc.colCount;
            this.cellWidth = desc.cellWidth;
            this.cellHeight = desc.cellHeight;
            this.texture = null;
        }
        
        WAESpriteSheet.prototype.loadTextureFromImage = function (gl, image) {
            this.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        };
        
        WAESpriteSheet.prototype.getCellCount = function () {
            return this.rowCount * this.colCount;
        };
        
        WAESpriteSheet.prototype.getTextureClip = function (cellIndex, cellCount = 1, inverse = false) {
            var clip = {};
            var clipCellW = 1.0 / this.colCount;
            var clipCellH = 1.0 / this.rowCount;
            clip.x1 = clipCellW * (cellIndex % this.colCount);
            clip.x2 = clip.x1 + clipCellW * cellCount;
            clip.y1 = clipCellH * Math.floor(cellIndex / this.colCount);
            clip.y2 = clip.y1 + clipCellH;
            return clip;
        };
        
        
        function WAEFrame(desc) {
            this.spriteSheet = desc.spriteSheet;
            this.cellIndex = desc.cellIndex;
            this.cellCount = desc.cellCount;
            this.center = { x: desc.center.x, y: desc.center.y };
            this.width = desc.spriteSheet.cellWidth * desc.cellCount;
            this.height = desc.spriteSheet.cellHeight;
        }
        
        
        function WAEAnimation(desc) {
            this.name = desc.name;
            this.frameCount = desc.frameCount;
            this.isLoop = desc.isLoop;
            this.next = desc.next;
            this.ttl = desc.ttl;
            this.frameList = [];
            this.endTimeList = [];
        }
   
        WAEAnimation.prototype.addFrame = function (index, frame, endTime) {
            this.frameList[index] = frame;
            this.endTimeList[index] = endTime;
        };

        
        function WAEObject(desc) {
            this.oid = desc.oid;
            this.type = desc.type;
            this.name = desc.name;
            this.animList = [];
        }
        
        WAEObject.prototype.addAnimationAt = function (slot, anim) {
            this.animList[slot] = anim;
        };

        
        function WAESprite(desc) {
            this.object = desc.object;
            this.action = desc.action;
            this.team = desc.team;
            this.position = { x: desc.position.x, y: desc.position.y };
            this.zDepth = desc.zDepth;
            this.scene = null;
            this.frameNum = 0;
            this.state = 0;
            this.time = 0;
        }
        
        WAESprite.prototype.getCurrentFrame = function () {
            return this.object.animList[this.action].frameList[this.frameNum];
        };
        
        WAESprite.prototype.changeAction = function (newAction) {
            
        };
       
        WAESprite.prototype.update = function () {
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
                    if (!anim.isLoop) {
                        this.changeAction(anim.next);
                    }
                }
            }
        };
        
        WAESprite.prototype.addToRenderBatch = function () {
            waeSpriteBatcher.addSpriteToBatch(this);
        };
        
        
        function WAELayer() {
            this.spriteList = [];
            this.batchData = null;
        }

        WAELayer.prototype.addSprite = function (sprite) {
            var newIndex = null;
            for (var i = 0; i < this.spriteList.length; i++) {
                if (!this.spriteList[i]) {
                    newIndex = i;
                    this.spriteList[i] = sprite;
                }
            }
            if (!newIndex) {
                newIndex = this.spriteList.length;
                this.spriteList[newIndex] = sprite;
            }
        }
        
        WAELayer.prototype.update = function () {
            for (var i = 0; i < this.spriteList.length; i++) {
                if (this.spriteList[i]) {
                    this.spriteList[i].update();
                }
            }
        }
        
        WAELayer.prototype.render = function (gl, shader) {
            
            this.batchData = [];
            for (var i = 0; i < this.spriteList.length; i++) {
                if (this.spriteList[i]) {
                    var sprite = this.spriteList[i];
                    var frame = sprite.getCurrentFrame();
                    var x1 = sprite.position.x - frame.center.x;
                    var x2 = x1 + frame.width;
                    var y1 = sprite.position.y - frame.center.y;
                    var y2 = y1 + frame.height;
                    var ssid = frame.spriteSheet.ssid;
                    var texClip = frame.spriteSheet.getTextureClip(frame.cellIndex);
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
            
            for (var ssid = 0; ssid < this.batchData.length; ssid++) {
                if (this.batchData[ssid]) { 
                    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.positions);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.batchData[ssid].positions), gl.STATIC_DRAW);
                    gl.vertexAttribPointer(shader.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
                    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.texCoords);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.batchData[ssid].texCoords), gl.STATIC_DRAW);
                    gl.vertexAttribPointer(shader.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.batchData[ssid].indices), gl.STATIC_DRAW);
                    gl.bindTexture(gl.TEXTURE_2D, waeSpriteSheetList[ssid].texture);
                    gl.drawElements(gl.TRIANGLES, this.batchData[ssid].indices.length, gl.UNSIGNED_SHORT, 0);
                }
            }
            
        }
        
        
        function WAEScene(name) {
            this.name = name;
            this.layerList = [];
        }

        WAEScene.prototype.addSpriteToLayer = function (layerIndex, sprite) {
            if (!this.layerList[layerIndex]) {
                this.layerList[layerIndex] = new WAELayer();
            }
            this.layerList[layerIndex].addSprite(sprite);
            sprite.scene = this;
        }
        
        WAEScene.prototype.update = function () {
            for (var i = 0; i < this.layerList.length; i++) {
                if (this.layerList[i]) {
                    this.layerList[i].update();
                }
            }
        };
        
        WAEScene.prototype.render = function () {
            for (var i = 0; i < this.layerList.length; i++) {
                if (this.layerList[i]) {
                    this.layerList[i].render();
                }
            }
        };
        
        
        return {
            SpriteSheet: WAESpriteSheet,
            Frame: WAEFrame,
            Animation: WAEAnimation,
            StoredObject: WAEObject,
            Sprite: WAESprite,
            Scene: WAEScene,
            spriteBatcher: waeSpriteBatcher,
            spriteSheetList: waeSpriteSheetList,
            objectList: waeObjectList
        };
        
    
    }

);