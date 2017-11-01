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
                var f = new WAECore.Frame({
                    spriteSheet: ssList[0],
                    cell: { row: 5, col: 0, rowSpan: 1, colSpan: 1 },
                    center: { x: 8, y: 8 }
                });
                var anim = new WAECore.Animation({
                    name: 'Idle',
                    next: 0
                });
                anim.addFrame(0, f, 10);
                var obj = new WAECore.StoredObject({
                    oid: 0,
                    type: 0,
                    name: 'Fighter'
                });
                obj.addAnimation(0, anim);
                objList[obj.oid] = obj;
            }
            
            {
                var fArr = [
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
                    name: 'Idle',
                    next: 0
                });
                anim.addFrameByArray(fArr, [10, 20, 30, 40]);
                var obj = new WAECore.StoredObject({
                    oid: 1,
                    type: 0,
                    name: 'Balloon'
                });
                obj.addAnimation(0, anim);
                objList[obj.oid] = obj;
            }
            
            {
                var fArr = [
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 1, col: 0, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 1, col: 1, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 1, col: 2, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }), 
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 1, col: 3, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    })
                ];
                var anim = new WAECore.Animation({
                    name: 'Idle',
                    next: 0
                });
                anim.addFrameByArray(fArr, [10, 20, 30, 40]);
                var obj = new WAECore.StoredObject({
                    oid: 2,
                    type: 0,
                    name: 'Coin'
                });
                obj.addAnimation(0, anim);
                objList[obj.oid] = obj;
            }
            
            {
                var fArr = [
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 2, col: 0, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 2, col: 1, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 2, col: 2, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }), 
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 2, col: 3, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    })
                ];
                var anim = new WAECore.Animation({
                    name: 'Idle',
                    next: 0
                });
                anim.addFrameByArray(fArr, [10, 20, 30, 40]);
                var obj = new WAECore.StoredObject({
                    oid: 2,
                    type: 0,
                    name: 'Biter'
                });
                obj.addAnimation(0, anim);
                objList[obj.oid] = obj;
            }
            
            {
                var fArr = [
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 3, col: 0, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 3, col: 1, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 3, col: 2, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }), 
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 3, col: 3, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    })
                ];
                var anim = new WAECore.Animation({
                    name: 'Idle',
                    next: 0
                });
                anim.addFrameByArray(fArr, [10, 20, 30, 40]);
                var obj = new WAECore.StoredObject({
                    oid: 4,
                    type: 0,
                    name: 'Bear'
                });
                obj.addAnimation(0, anim);
                objList[obj.oid] = obj;
            }

            {
                var f0 = new WAECore.Frame({
                    spriteSheet: ssList[0],
                    cell: { row: 5, col: 1, rowSpan: 1, colSpan: 1 },
                    center: { x: 8, y: 8 }
                });
                var anim0 = new WAECore.Animation({
                    name: 'Fly',
                    next: 0
                });
                anim0.addFrame(0, f0, 10);
                var fArr1 = [
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 6, col: 0, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 6, col: 1, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 6, col: 2, rowSpan: 1, colSpan: 1 },
                        center: { x: 8, y: 8 }
                    }), 
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 6, col: 3, rowSpan: 2, colSpan: 2 },
                        center: { x: 16, y: 16 }
                    }),
                    new WAECore.Frame({
                        spriteSheet: ssList[0],
                        cell: { row: 6, col: 5, rowSpan: 2, colSpan: 2 },
                        center: { x: 16, y: 16 }
                    })
                ];
                var anim1 = new WAECore.Animation({
                    name: 'Explode',
                    next: null
                });
                anim1.addFrameByArray(fArr1, [3, 6, 9, 12, 15]);
                var obj = new WAECore.StoredObject({
                    oid: 5,
                    type: 0,
                    name: 'Bullet'
                });
                obj.addAnimation(0, anim0);
                obj.addAnimation(1, anim1);
                objList[obj.oid] = obj;
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
            t_Scene.addSpriteToLayer(0, t_Scene.player);
            
            var enemy_1 = new WAECore.Sprite({
                object: objList[1],
                action: 0,
                team: 0,
                position: { x: 50, y: -200 },
                scale: 2
            });
            t_Scene.addSpriteToLayer(0, enemy_1);
            
            var enemy_1_ai = new WAECore.AI();
            enemy_1_ai.target = t_Scene.player;
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
            
            var testExp = new WAECore.Sprite({
                object: objList[5],
                action: 1,
                team: 0,
                position: { x: 50, y: -200 },
                scale: 2
            });
            t_Scene.addSpriteToLayer(0, testExp);
            
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
        

        function update(keyState) {
            
            t_Scene.update();
            
            if (keyState.left && !keyState.right) {
                t_Scene.player.velocity.x = -2;
            }
            else if (!keyState.left && keyState.right) {
                t_Scene.player.velocity.x = 2;
            }
            else {
                t_Scene.player.velocity.x = 0;
            }
            
        }

        function render(gl, shaders, buffers) {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            t_Scene.render(gl, shaders, buffers);
        }
        
        
        const gl = document.getElementById('glCanvas').getContext("webgl");
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
        
        // Initialize key states
        const keyState = {
            left: 0,
            right: 0
        }

        var imageUrls = [
            './assets/texture/all.png'
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
                update(keyState);
                render(gl, shaders, buffers);
                window.requestAnimationFrame(mainLoop);
            }
            
            window.requestAnimationFrame(mainLoop);

        });

        
    }

);