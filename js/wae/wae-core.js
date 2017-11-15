// wae-object.js

define(

    // Module Dependencies
    [],
    
    // Module Definition
    function () {
        
        var waeSpriteSheetList = [];
        var waeObjectList = [];

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
        
        WAESpriteSheet.prototype.getTextureClipByIndex = function (index) {
            var clip = {};
            var clipCellW = 1.0 / this.colCount;
            var clipCellH = 1.0 / this.rowCount;
            clip.x1 = clipCellW * (index % this.colCount);
            clip.x2 = clip.x1 + clipCellW * cellCount;
            clip.y1 = clipCellH * Math.floor(index / this.colCount);
            clip.y2 = clip.y1 + clipCellH;
            return clip;
        };
        
        WAESpriteSheet.prototype.getTextureClipByPosition = function (row, col, rowSpan = 1, colSpan = 1) {
            var clip = {};
            var clipCellW = 1.0 / this.colCount;
            var clipCellH = 1.0 / this.rowCount;
            clip.x1 = clipCellW * col;
            clip.x2 = clip.x1 + clipCellW * colSpan;
            clip.y1 = clipCellH * row;
            clip.y2 = clip.y1 + clipCellH * rowSpan;
            return clip;
        };
        
        
        function WAEFrame(desc) {
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
        
        
        function WAEAnimation(desc) {
            this.name = desc.name;
            this.next = desc.next;
            this.frameList = [];
            this.endTimeList = [];
        }
   
        WAEAnimation.prototype.addFrame = function (index, frame, endTime) {
            this.frameList[index] = frame;
            this.endTimeList[index] = endTime;
        };
        
        WAEAnimation.prototype.addFrameByArray = function (frameArr, endTimeArr) {
            this.frameList = frameArr.slice();
            this.endTimeList = endTimeArr.slice();
        };

        
        function WAEObject(desc) {
            this.oid = desc.oid;
            this.type = desc.type;
            this.name = desc.name;
            this.animList = [];
        }
        
        WAEObject.prototype.addAnimation = function (slot, anim) {
            this.animList[slot] = anim;
        };
        
        WAEObject.prototype.addAnimationByArray = function (animArr) {
            this.animList = animArr.slice();
        };

        
        function WAESprite(desc) {
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
                mode: WAESprite.CollisionMode.BY_SPRITE,
                hit: null,
                hurt: null
            };
        }
        
        WAESprite.CollisionMode = Object.freeze({
            BY_SPRITE: 'BY_SPRITE',
            BY_FRAME: 'BY_FRAME'
        });
        
        WAESprite.CollisionShape = Object.freeze({
            CIRCLE: 'CIRCLE',
            RECT: 'RECT'
        });
        
        WAESprite.prototype.getCurrentFrame = function () {
            return this.object.animList[this.action].frameList[this.frameNum];
        };
        
        WAESprite.prototype.changeAction = function (newAction) {
            this.action = newAction;
            this.time = 0;
            this.frameNum = 0;
        };
        
        WAESprite.prototype.setAI = function (ai) {
            ai.self = this;
            this.ai = ai;
        };
        
        WAESprite.prototype.addAI = function (aiExecuteFunction) {
            var ai = new WAEAI();
            ai.execute = aiExecuteFunction;
            ai.self = this;
            this.ai = ai;
        }
       
        WAESprite.prototype.update = function () {
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
        
        
        function WAEAI() {
            this.self = null;
            this.target = null;
            this.execute = null;
        }
        
        
        function WAELayer(desc) {
            this.lid = desc.lid;
            this.spriteList = [];
            this.batchData = null;
        }

        WAELayer.prototype.addSprite = function (sprite) {
            this.spriteList.push(sprite);
        };
        
        WAELayer.prototype.update = function () {
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
        
        WAELayer.prototype.render = function (gl, shaders, buffers) {
            
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
                    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.positions);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.batchData[ssid].positions), gl.STATIC_DRAW);
                    gl.vertexAttribPointer(shaders.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
                    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texCoords);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.batchData[ssid].texCoords), gl.STATIC_DRAW);
                    gl.vertexAttribPointer(shaders.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.batchData[ssid].indices), gl.STATIC_DRAW);
                    gl.bindTexture(gl.TEXTURE_2D, waeSpriteSheetList[ssid].texture);
                    gl.drawElements(gl.TRIANGLES, this.batchData[ssid].indices.length, gl.UNSIGNED_SHORT, 0);
                }
            }
            
        };
        
        
        function WAEScene(name) {
            this.name = name;
            this.layerList = [];
        }

        WAEScene.prototype.addSpriteToLayer = function (layerIndex, sprite, action = 0) {
            if (!this.layerList[layerIndex]) {
                var layer = new WAELayer({ lid: layerIndex });
                this.layerList[layerIndex] = layer;
            }
            this.layerList[layerIndex].addSprite(sprite);
            sprite.layer = this.layerList[layerIndex];
            sprite.scene = this;
            sprite.action = action;
        };
        
        WAEScene.prototype.getCollisions = function (layerIndexes = null) {
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
                        if (si.collision.mode == WAESprite.CollisionMode.BY_SPRITE) {
                            var hit = si.collision.hit;
                            if (!hit) { continue; }
                            iHitbox.shape = hit.shape;
                            if (iHitbox.shape == WAESprite.CollisionShape.CIRCLE) {
                                iHitbox.center = { x: si.position.x + hit.centerOffset.x, y: si.position.y + hit.centerOffset.y };
                                iHitbox.radius = hit.radius;
                            }
                            else if (iHitbox.mode == WAESprite.CollisionShape.RECT) {
                                iHitbox.x1 = si.position.x + hit.x1;
                                iHitbox.x2 = si.position.x + hit.x2;
                                iHitbox.y1 = si.position.y + hit.y1;
                                iHitbox.y2 = si.position.y + hit.y2;
                            }
                        }
                        else if (si.collision.mode == WAESprite.CollisionMode.BY_FRAME) {
                            // TODO
                        }
                        if (sj.collision.mode == WAESprite.CollisionMode.BY_SPRITE) {
                            var hurt = sj.collision.hurt;
                            if (!hurt) { continue; }
                            jHurtbox.shape = hurt.shape;
                            if (jHurtbox.shape == WAESprite.CollisionShape.CIRCLE) {
                                jHurtbox.center = { x: sj.position.x + hurt.centerOffset.x, y: sj.position.y + hurt.centerOffset.y };
                                jHurtbox.radius = hurt.radius;
                            }
                            else if (jHurtbox.mode == WAESprite.CollisionShape.RECT) {
                                jHurtbox.x1 = sj.position.x + hurt.x1;
                                jHurtbox.x2 = sj.position.x + hurt.x2;
                                jHurtbox.y1 = sj.position.y + hurt.y1;
                                jHurtbox.y2 = sj.position.y + hurt.y2;
                            }
                        }
                        else if (sj.collision.mode == WAESprite.CollisionMode.BY_FRAME) {
                            // TODO
                        }
                        if (iHitbox.shape == WAESprite.CollisionShape.CIRCLE && jHurtbox.shape == WAESprite.CollisionShape.CIRCLE) {
                            var dx = iHitbox.center.x - jHurtbox.center.x, dy = iHitbox.center.y - jHurtbox.center.y;
                            var dist = Math.sqrt(dx * dx + dy * dy);
                            if (iHitbox.radius + jHurtbox.radius > dist) {
                                collisions.push({
                                    hiter: si,
                                    hurter: sj
                                });
                            }
                        }
                        else if (iHitbox.shape == WAESprite.CollisionShape.RECT && jHurtbox.shape == WAESprite.CollisionShape.RECT) {
                            // TODO
                        }
                    } 
                }
            }
            return collisions;
        };
        
        WAEScene.prototype.update = function () {
            for (var i = 0; i < this.layerList.length; i++) {
                if (this.layerList[i]) {
                    this.layerList[i].update();
                }
            }
        };
        
        WAEScene.prototype.render = function (gl, shaders, buffers) {
            for (var i = 0; i < this.layerList.length; i++) {
                if (this.layerList[i]) {
                    this.layerList[i].render(gl, shaders, buffers);
                }
            }
        };
        
        
        return {
            
            // "Classes"
            SpriteSheet: WAESpriteSheet,
            Frame: WAEFrame,
            Animation: WAEAnimation,
            StoredObject: WAEObject,
            Sprite: WAESprite,
            AI: WAEAI,
            Scene: WAEScene,
            
            // Global Objects
            spriteSheetList: waeSpriteSheetList,
            objectList: waeObjectList

        };
        
    
    }

);