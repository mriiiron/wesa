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
            
            // Player
            {
                var ss = new WAECore.SpriteSheet({
                    ssid: 0,
                    rowCount: 1,
                    colCount: 2,
                    cellWidth: 16,
                    cellHeight: 16
                });
                ss.loadTextureFromImage(gl, loadedImages[0]);
                ssList[0] = ss;
            }
            
            // Enemy
            {
                var ss = new WAECore.SpriteSheet({
                    ssid: 1,
                    rowCount: 5,
                    colCount: 5,
                    cellWidth: 16,
                    cellHeight: 16
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
                    center: { x: 8, y: 8 }
                });
                var anim = new WAECore.Animation({
                    name: 'Idle',
                    isLoop: true,
                    next: 0,
                    ttl: 0
                });
                anim.addFrame(0, f1, 10);
                var obj = new WAECore.StoredObject({
                    oid: 0,
                    type: 0,
                    name: 'Player'
                });
                obj.addAnimationAt(0, anim);
                objList[0] = obj;
            }
            
            {
                var f1 = new WAECore.Frame({
                    spriteSheet: ssList[1],
                    cellIndex: 0,
                    cellCount: 1,
                    center: { x: 8, y: 8 }
                });
                var f2 = new WAECore.Frame({
                    spriteSheet: ssList[1],
                    cellIndex: 1,
                    cellCount: 1,
                    center: { x: 8, y: 8 }
                });
                var f3 = new WAECore.Frame({
                    spriteSheet: ssList[1],
                    cellIndex: 2,
                    cellCount: 1,
                    center: { x: 8, y: 8 }
                }); 
                var f4 = new WAECore.Frame({
                    spriteSheet: ssList[1],
                    cellIndex: 3,
                    cellCount: 1,
                    center: { x: 8, y: 8 }
                });
                var anim = new WAECore.Animation({
                    name: 'Idle',
                    isLoop: true,
                    next: 0,
                    ttl: 0
                });
                anim.addFrame(0, f1, 10);
                anim.addFrame(1, f2, 20);
                anim.addFrame(2, f3, 30);
                anim.addFrame(3, f4, 40);
                var obj = new WAECore.StoredObject({
                    oid: 1,
                    type: 0,
                    name: 'Balloon'
                });
                obj.addAnimationAt(0, anim);
                objList[1] = obj;
            }
            
            {
                var f1 = new WAECore.Frame({
                    spriteSheet: ssList[1],
                    cellIndex: 5,
                    cellCount: 1,
                    center: { x: 8, y: 8 }
                });
                var f2 = new WAECore.Frame({
                    spriteSheet: ssList[1],
                    cellIndex: 6,
                    cellCount: 1,
                    center: { x: 8, y: 8 }
                });
                var f3 = new WAECore.Frame({
                    spriteSheet: ssList[1],
                    cellIndex: 7,
                    cellCount: 1,
                    center: { x: 8, y: 8 }
                }); 
                var f4 = new WAECore.Frame({
                    spriteSheet: ssList[1],
                    cellIndex: 8,
                    cellCount: 1,
                    center: { x: 8, y: 8 }
                });
                var anim = new WAECore.Animation({
                    name: 'Idle',
                    isLoop: true,
                    next: 0,
                    ttl: 0
                });
                anim.addFrame(0, f1, 10);
                anim.addFrame(1, f2, 20);
                anim.addFrame(2, f3, 30);
                anim.addFrame(3, f4, 40);
                var obj = new WAECore.StoredObject({
                    oid: 2,
                    type: 0,
                    name: 'Coin'
                });
                obj.addAnimationAt(0, anim);
                objList[2] = obj;
            }
            
            {
                var f1 = new WAECore.Frame({
                    spriteSheet: ssList[1],
                    cellIndex: 10,
                    cellCount: 1,
                    center: { x: 8, y: 8 }
                });
                var f2 = new WAECore.Frame({
                    spriteSheet: ssList[1],
                    cellIndex: 11,
                    cellCount: 1,
                    center: { x: 8, y: 8 }
                });
                var f3 = new WAECore.Frame({
                    spriteSheet: ssList[1],
                    cellIndex: 12,
                    cellCount: 1,
                    center: { x: 8, y: 8 }
                }); 
                var f4 = new WAECore.Frame({
                    spriteSheet: ssList[1],
                    cellIndex: 13,
                    cellCount: 1,
                    center: { x: 8, y: 8 }
                });
                var anim = new WAECore.Animation({
                    name: 'Idle',
                    isLoop: true,
                    next: 0,
                    ttl: 0
                });
                anim.addFrame(0, f1, 10);
                anim.addFrame(1, f2, 20);
                anim.addFrame(2, f3, 30);
                anim.addFrame(3, f4, 40);
                var obj = new WAECore.StoredObject({
                    oid: 2,
                    type: 0,
                    name: 'Biter'
                });
                obj.addAnimationAt(0, anim);
                objList[3] = obj;
            }
            
            {
                var f1 = new WAECore.Frame({
                    spriteSheet: ssList[1],
                    cellIndex: 15,
                    cellCount: 1,
                    center: { x: 8, y: 8 }
                });
                var f2 = new WAECore.Frame({
                    spriteSheet: ssList[1],
                    cellIndex: 16,
                    cellCount: 1,
                    center: { x: 8, y: 8 }
                });
                var f3 = new WAECore.Frame({
                    spriteSheet: ssList[1],
                    cellIndex: 17,
                    cellCount: 1,
                    center: { x: 8, y: 8 }
                }); 
                var f4 = new WAECore.Frame({
                    spriteSheet: ssList[1],
                    cellIndex: 18,
                    cellCount: 1,
                    center: { x: 8, y: 8 }
                });
                var anim = new WAECore.Animation({
                    name: 'Idle',
                    isLoop: true,
                    next: 0,
                    ttl: 0
                });
                anim.addFrame(0, f1, 10);
                anim.addFrame(1, f2, 20);
                anim.addFrame(2, f3, 30);
                anim.addFrame(3, f4, 40);
                var obj = new WAECore.StoredObject({
                    oid: 4,
                    type: 0,
                    name: 'Bear'
                });
                obj.addAnimationAt(0, anim);
                objList[4] = obj;
            }

        }

        function initGameplay(objList, player) {
            
            t_Scene = new WAECore.Scene('TestScene');
            
            t_Scene.player = new WAECore.Sprite({
                object: objList[0],
                action: 0,
                team: 0,
                position: { x: 0, y: -250 },
                scale: 2
            });
            t_Scene.addSpriteToLayer(0, player);
            
            var enemy_1 = new WAECore.Sprite({
                object: objList[1],
                action: 0,
                team: 0,
                position: { x: 50, y: -200 },
                scale: 2
            });
            t_Scene.addSpriteToLayer(0, enemy_1);
            
            var enemy_1_ai = new WAECore.AI();
            enemy_1_ai.target = player;
            enemy_1_ai.execute = function () {
                if (this.self.position.x > this.target.position.x) {
                    this.self.velocity.x = -1;
                }
                else if (this.self.position.x < this.target.position.x) {
                    this.self.velocity.x = 1;
                }
                else {
                    this.self.velocity.x = 0;
                }
            }
            
            enemy_1.setAI(enemy_1_ai);
            
            /*
            t_Scene.addSpriteToLayer(0, new WAECore.Sprite({
                object: objList[2],
                action: 0,
                team: 0,
                position: { x: 156, y: 300 },
                scale: 2
            }));
            t_Scene.addSpriteToLayer(0, new WAECore.Sprite({
                object: objList[3],
                action: 0,
                team: 0,
                position: { x: 188, y: 300 },
                scale: 2
            }));
            t_Scene.addSpriteToLayer(0, new WAECore.Sprite({
                object: objList[4],
                action: 0,
                team: 0,
                position: { x: 220, y: 300 },
                scale: 2
            }));
            */
        }
        
        function initInput(keyState) {
            document.onkeydown = function (e) {
                // console.log('keyDown: ' + e.keyCode);
                switch (e.keyCode) {
                    case 37:
                        keyState.left = 1;
                        break;
                    case 39:
                        keyState.right = 1;
                        break;
                    default:
                        break;
                }
            };
            document.onkeyup = function (e) {
                // console.log('keyUp: ' + e.keyCode);
                switch (e.keyCode) {
                    case 37:
                        keyState.left = 0;
                        break;
                    case 39:
                        keyState.right = 0;
                        break;
                    default:
                        break;
                }
            };
        }
        

        function update() {
            t_Scene.update();
            
            
            
        }

        function render(gl, shaders, buffers) {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            t_Scene.render(gl, shaders, buffers);
        }
        
        
        const gl = document.getElementById('glCanvas').getContext("webgl");
        if (!gl) {
            alert("Unable to initialize WebGL. Your browser or machine may not support it.");
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
        
        // Initialize key states
        const keyState = {
            left: 0,
            right: 0
        }

        var imageUrls = [
            './assets/texture/player.png',
            './assets/texture/enemy.png'
        ];
        
        loadImages(imageUrls).done(function (newImages) {
            
            WAEHelper.initGLConfig(gl, shaders);
            
            loadSpriteSheets(gl, newImages, WAECore.spriteSheetList);
            loadGameObjects(WAECore.spriteSheetList, WAECore.objectList);
            initGameplay(WAECore.objectList);
            initInput(keyState);
            
            var start = null;
        
            function mainLoop(now) {
                if (!start) start = now;
                var delta = (now - start) / 1000.0;
                var fps = 1.0 / delta;
                // console.log(fps);
                start = now;
                update();
                render(gl, shaders, buffers);
                window.requestAnimationFrame(mainLoop);
            }
            
            window.requestAnimationFrame(mainLoop);

        });

        
    }

);