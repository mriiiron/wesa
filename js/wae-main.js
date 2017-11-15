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
                objList[obj.oid] = obj;
            }
            
            
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
                    })
                ];
                var anim = new WAECore.Animation({
                    name: 'Floating',
                    next: 0
                });
                anim.addFrameByArray(f, [10, 20, 30, 40]);
                var obj = new WAECore.StoredObject({
                    oid: 10,
                    type: 0,
                    name: 'Balloon'
                });
                obj.addAnimation(0, anim);
                objList[obj.oid] = obj;
            }
            
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
            
        }

        function initGameplay(objList) {
            
            t_Scene = new WAECore.Scene('TestScene');
            
            t_Scene.inputState = {
                mouse: { x: 0, y: 0 }
            }
            
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
                        this.self.changeAction(1);
                    }
                    else {
                        this.self.changeAction(3);
                    }
                }
                else {
                    if (dy > 0) {
                        this.self.changeAction(2);
                    }
                    else {
                        this.self.changeAction(0);
                    }
                }
                
                
                
            });
            t_Scene.addSpriteToLayer(1, player);
            t_Scene.player = player;

            
            var testEnemy = new WAECore.Sprite({
                object: objList[10],
                action: 0,
                team: 1,
                position: { x: 50, y: -100 },
                scale: 2
            });
            testEnemy.addAI(function () {
                
            });
            testEnemy.collision.hurt = {
                shape: WAECore.Sprite.CollisionShape.CIRCLE,
                centerOffset: { x: 0, y: 0 },
                radius: 16
            }
            t_Scene.addSpriteToLayer(1, testEnemy);
            
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
        
        function initInput(inputState) {
            
            canvas.onmousemove = function(e) {
                inputState.mouse.x = e.pageX - canvas.offsetLeft - 240;
                inputState.mouse.y = 320 - (e.pageY - canvas.offsetTop);
                output.innerText = 'Mouse: (' + inputState.mouse.x + ', ' + inputState.mouse.y + ')';
            };
            
            canvas.onmousedown = function(e) {
                var player = t_Scene.player;
                player.changeAction((player.action + 1) % 4);
                
                var bomb = new WAECore.Sprite({
                    object: WAECore.objectList[1],
                    action: 0,
                    team: 0,
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
        

        function update() {
            t_Scene.update();
            var collisions = t_Scene.getCollisions();
            if (collisions.length > 0) {
                console.log(collisions);
            }
        }

        function render(gl, shaders, buffers) {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            t_Scene.render(gl, shaders, buffers);
        }


        var imageUrls = [
            './assets/texture/all.png'
        ];
        
        loadImages(imageUrls).done(function (newImages) {
            
            WAEHelper.initGLConfig(gl, shaders);
            
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
                update();
                render(gl, shaders, buffers);
                window.requestAnimationFrame(mainLoop);
            }
            
            window.requestAnimationFrame(mainLoop);

        });

        
    }

);