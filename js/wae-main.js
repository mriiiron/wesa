// wae-main.js


// RequireJS Configuration
requirejs.config({
    baseUrl: './js/wae',
    paths: {
        'WAECore': './wae-core',
        'WAEHelper': './wae-helper',
        'glMatrix': './external/gl-matrix-min'
    },
    
    // Use it in dev to bust cache
    urlArgs: 'bust=' +  (new Date()).getTime()
    
});


// RequireJS Main
requirejs(
    
    // Load all modules
    ['WAECore', 'WAEHelper'],
    
    // main()
    function (WAECore, WAEHelper) {
        
        // Global WAE objects
        var t_Scene = null;       // TODO: WAESceneManager (maybe)
        
        const canvas = document.getElementById('canvas');
        const output = document.getElementById('output');
        const gl = canvas.getContext("webgl");
        if (!gl) {
            alert('Unable to initialize WebGL. Your browser or machine may not support it.');
            return;
        }

        // Initialize shader programs
        const shaderProgram = WAEHelper.initShaderProgram(gl, WAEHelper.shaderSource.vs, WAEHelper.shaderSource.fs);

        // Setup shader input locations
        const shaders = {
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
        
        // Initialize buffers
        const buffers = {
            positions: gl.createBuffer(),
            texCoords: gl.createBuffer(),
            indices: gl.createBuffer()
        };
           
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

        
        function loadSpriteSheets(gl, loadedImages, ssList) {
            {
                var ss = new WAECore.SpriteSheet({
                    ssid: 0,
                    rowCount: 10,
                    colCount: 10,
                    cellWidth: 16,
                    cellHeight: 16
                });
                ss.loadTextureFromImage(gl, loadedImages[0]);
                ssList[0] = ss;
            }
        }
        
        function loadGameObjects(ssList, objList) {
            
            // Bomberman
            {
                var f = [
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 8, col: 0, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 8, col: 1, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 8, col: 2, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }), 
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 8, col: 3, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 8, col: 4, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 8, col: 5, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 9, col: 0, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }), 
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 9, col: 1, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 9, col: 2, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 9, col: 3, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 9, col: 4, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }), 
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 9, col: 5, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 8, col: 6, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 8, col: 7, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 8, col: 8, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 9, col: 6, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 9, col: 7, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 9, col: 8, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    })
                ];
                var obj = new WAECore.StoredObject({
                    oid: 0,
                    type: 0,
                    name: 'Bomberman'
                });
                {
                    var anim = new WAECore.Animation({
                        name: 'MoveDown',
                        next: 0
                    });
                    anim.addFrameByArray([f[1], f[0], f[2], f[0]], [8, 16, 24, 32]);
                    obj.addAnimation(0, anim);
                }
                {
                    var anim = new WAECore.Animation({
                        name: 'MoveRight',
                        next: 1
                    });
                    anim.addFrameByArray([f[3], f[4], f[5], f[4]], [8, 16, 24, 32]);
                    obj.addAnimation(1, anim);
                }
                {
                    var anim = new WAECore.Animation({
                        name: 'MoveUp',
                        next: 2
                    });
                    anim.addFrameByArray([f[7], f[6], f[8], f[6]], [8, 16, 24, 32]);
                    obj.addAnimation(2, anim);
                }
                {
                    var anim = new WAECore.Animation({
                        name: 'MoveLeft',
                        next: 3
                    });
                    anim.addFrameByArray([f[9], f[10], f[11], f[10]], [8, 16, 24, 32]);
                    obj.addAnimation(3, anim);
                }
                {
                    var anim = new WAECore.Animation({
                        name: 'Dead',
                        next: null
                    });
                    anim.addFrameByArray([f[12], f[13], f[14], f[15], f[16], f[17]], [30, 20, 15, 12, 10, 8]);
                    obj.addAnimation(4, anim);
                }
                objList[obj.oid] = obj;
            }
            
            // Bomb
            {
                var f = [
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 7, col: 0, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 7, col: 1, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 7, col: 2, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 5, col: 3, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 4, col: 4, rowSpan: 2, colSpan: 2 },
                        center: { x: 16, y: 16 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 4, col: 6, rowSpan: 2, colSpan: 2 },
                        center: { x: 16, y: 16 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 4, col: 8, rowSpan: 2, colSpan: 2 },
                        center: { x: 16, y: 16 }
                    }),
                ];
                var obj = new WAECore.StoredObject({
                    oid: 1,
                    type: 0,
                    name: 'Bomb'
                });
                {
                    var anim = new WAECore.Animation({
                        name: 'Ticking',
                        next: 0
                    });
                    anim.addFrameByArray([f[0], f[1], f[2], f[1]], [15, 30, 45, 60]);
                    obj.addAnimation(0, anim);
                }
                {
                    var anim = new WAECore.Animation({
                        anim: 'Explode',
                        next: null
                    });
                    anim.addFrameByArray([f[3], f[4], f[5], f[6]], [3, 6, 9, 12]);
                    obj.addAnimation(1, anim);
                }
                objList[obj.oid] = obj;
            }
            
            // Balloon
            {
                var f = [
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 0, col: 0, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 0, col: 1, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 0, col: 2, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }), 
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 0, col: 3, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 0, col: 4, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 0, col: 5, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 0, col: 6, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 4, col: 0, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 4, col: 1, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 4, col: 2, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 4, col: 3, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 0, col: 9, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 1, col: 9, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 2, col: 9, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 3, col: 9, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    })
                ];
                var obj = new WAECore.StoredObject({
                    oid: 10,
                    type: 0,
                    name: 'Balloon'
                });
                {
                    var anim = new WAECore.Animation({
                        name: 'MoveRight',
                        next: 0
                    });
                    anim.addFrameByArray([f[0], f[1], f[2], f[1]], [8, 16, 24, 32]);
                    obj.addAnimation(0, anim);
                }
                {
                    var anim = new WAECore.Animation({
                        name: 'MoveLeft',
                        next: 1
                    });
                    anim.addFrameByArray([f[5], f[4], f[3], f[4]], [8, 16, 24, 32]);
                    obj.addAnimation(1, anim);
                }
                {
                    var anim = new WAECore.Animation({
                        name: 'Dead',
                        next: null
                    });
                    anim.addFrameByArray([f[6], f[7], f[8], f[9], f[10]], [30, 20, 10, 7, 4]);
                    obj.addAnimation(2, anim);
                }
                {
                    var anim = new WAECore.Animation({
                        name: 'Spawn',
                        next: 3
                    });
                    anim.addFrameByArray([f[11], f[12], f[13], f[14], f[13], f[12], f[11]], [3, 3, 3, 3, 3, 3, 3]);
                    obj.addAnimation(3, anim);
                }
                objList[obj.oid] = obj;
            }
            
        }

        function initGameplay(objList) {
            
            t_Scene = new WAECore.Scene('TestScene');
            
            t_Scene.inputState = {
                mouse: { x: 0, y: 0 }
            }
            
            t_Scene.enemyCount = 0;
            
            t_Scene.enemyAI = function () {
                if (this.self.spawnDelay > 0) {
                    this.self.spawnDelay--;
                    return;
                }
                else if (!this.self.spawned) {
                    this.self.spawned = true;
                    this.self.changeAction(0);
                }
                var dx = this.target.position.x - this.self.position.x;
                var dy = this.target.position.y - this.self.position.y;
                var d = Math.sqrt(dx * dx + dy * dy);
                if (dx > 0) {
                    if (this.self.action != 0) { this.self.changeAction(0); }
                }
                else {
                    if (this.self.action != 1) { this.self.changeAction(1); }
                }
                this.self.velocity = { x: 1 * dx / d, y: 1 * dy / d };
            };
            
            var player = new WAECore.Sprite({
                object: objList[0],
                action: 0,
                team: 0,
                position: { x: 0, y: -250 },
                scale: 2
            });
            player.addAI(function () {
                var dx = t_Scene.inputState.mouse.x - this.self.position.x;
                var dy = t_Scene.inputState.mouse.y - this.self.position.y;
                var d = Math.sqrt(dx * dx + dy * dy);
                if (Math.abs(dy / dx) <= 1) {
                    if (dx > 0) {
                        if (this.self.action != 1) { this.self.changeAction(1); }
                    }
                    else {
                        if (this.self.action != 3) { this.self.changeAction(3); }
                    }
                }
                else {
                    if (dy > 0) {
                        if (this.self.action != 2) { this.self.changeAction(2); }
                    }
                    else {
                        if (this.self.action != 0) { this.self.changeAction(0); }
                    }
                }
                if (d > 100) {
                    this.self.velocity = { x: 3 * dx / d, y: 3 * dy / d };
                }
                else if (d > 50) {
                    this.self.velocity = { x: 2 * dx / d, y: 2 * dy / d };
                }
                else if (d > 5){
                    this.self.velocity = { x: 1 * dx / d, y: 1 * dy / d };
                }
                else {
                    this.self.velocity = { x: 0, y: 0 };
                }
            });
            player.collision.hurt = {
                shape: WAECore.Sprite.CollisionShape.CIRCLE,
                centerOffset: { x: 0, y: 0 },
                radius: 16
            }
            t_Scene.addSpriteToLayer(1, player);
            t_Scene.player = player;

        }
        
        function initInput(inputState) {
            
            canvas.onmousemove = function(e) {
                inputState.mouse.x = e.pageX - canvas.offsetLeft - canvas.width / 2;
                inputState.mouse.y = canvas.height / 2 - (e.pageY - canvas.offsetTop);
                //output.innerText = 'Mouse: (' + inputState.mouse.x + ', ' + inputState.mouse.y + ')';
            };
            
            canvas.onmousedown = function(e) {
                var player = t_Scene.player;
                var bomb = new WAECore.Sprite({
                    object: WAECore.objectList[1],
                    action: 0,
                    team: 2,
                    position: { x: player.position.x, y: player.position.y },
                    scale: 2
                });
                bomb.timer = 60;
                bomb.addAI(function () {
                    if (this.self.timer == 0) {
                        this.self.changeAction(1);
                        this.self.collision.hit = {
                            shape: WAECore.Sprite.CollisionShape.CIRCLE,
                            centerOffset: { x: 0, y: 0 },
                            radius: 32
                        }
                    }
                    this.self.timer--;
                });
                t_Scene.addSpriteToLayer(0, bomb);
            };
            
        }
        

        function update(objList) {
            t_Scene.update();
            var collisions = t_Scene.getCollisions();
            if (collisions.length > 0) {
                for (var i = 0; i < collisions.length; i++) {
                    var coll = collisions[i];
                    if (coll.hiter.team != coll.hurter.team) {
                        if (coll.hurter.object.name == 'Balloon') {
                            coll.hurter.ai = null;
                            coll.hurter.collision.hurt = null;
                            coll.hurter.velocity = { x: 0, y: 0 };
                            coll.hurter.changeAction(2);
                            t_Scene.enemyCount--;
                        }
                        else if (coll.hurter.object.name == 'Bomberman') {
                            coll.hurter.ai = null;
                            coll.hurter.collision.hurt = null;
                            coll.hurter.velocity = { x: 0, y: 0 };
                            coll.hurter.changeAction(4);
                        }
                    }
                    //console.log(coll);
                }
            }
            if (t_Scene.enemyCount < 3) {
                var enemy = new WAECore.Sprite({
                    object: objList[10],
                    action: 0,
                    team: 1,
                    position: { x: Math.random() * 400 - 200, y: Math.random() * 400 - 200 },
                    scale: 2
                });
                enemy.spawnDelay = 60;
                enemy.spawned = false;
                enemy.addAI(t_Scene.enemyAI);
                enemy.ai.target = t_Scene.player;
                enemy.collision.hurt = {
                    shape: WAECore.Sprite.CollisionShape.CIRCLE,
                    centerOffset: { x: 0, y: 0 },
                    radius: 16
                }
                enemy.collision.hit = {
                    shape: WAECore.Sprite.CollisionShape.CIRCLE,
                    centerOffset: { x: 0, y: 0 },
                    radius: 10
                }
                t_Scene.addSpriteToLayer(1, enemy, 3);
                t_Scene.enemyCount++;
            }
            output.innerText = 'Enemy Count: ' + t_Scene.enemyCount;
        }

        function render(gl, shaders, buffers) {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            t_Scene.render(gl, shaders, buffers);
        }


        var imageUrls = [
            './assets/texture/all.png'
        ];
        
        loadImages(imageUrls).done(function (newImages) {
            
            WAEHelper.initGLConfig(canvas, gl, shaders);
            
            loadSpriteSheets(gl, newImages, WAECore.spriteSheetList);
            loadGameObjects(WAECore.spriteSheetList, WAECore.objectList);
            initGameplay(WAECore.objectList);
            initInput(t_Scene.inputState);
            
            var start = null;
        
            function mainLoop(now) {
                if (!start) start = now;
                var delta = (now - start) / 1000.0;
                var fps = 1.0 / delta;
                // console.log(fps);
                start = now;
                update(WAECore.objectList);
                render(gl, shaders, buffers);
                window.requestAnimationFrame(mainLoop);
            }
            
            window.requestAnimationFrame(mainLoop);

        });

        
    }

);