(function (window, wesa) {
    'use strict'

    function OpenCity () {

        const OCConfig = Object.freeze({
            Team: {
                Null: 0,
                Player: 1,
                Enemy: 2
            },
            TankType: {
                Player: 0,
                Light: 3,
                Agile: 4,
                Power: 5,
                Heavy: 6
            },
            TileType: {
                Null: 0,
                Steel: 1,
                Woods: 2,
                Ice: 3,
                Water: 4,
                Brick: 5,
                Solid: 7
            },
            ObjectType: {
                Tank: 0,
                Stationary: 1,
                Mobile: 2
            },
            CollisionMatrix: [
                [true, true, false],
                [false, false, false],
                [true, true, true]
            ]
        });


        function OCMap(desc) {
            let img = document.getElementById(desc.imgID);
            let canvas = document.createElement('canvas');
            let context = canvas.getContext('2d');
            this.scene = desc.scene;
            this.width = canvas.width = img.naturalWidth;
            this.height = canvas.height = img.naturalHeight;
            this.data = [];
            this.eagleSpawnPoint = {
                x: 12,
                y: 0
            };
            this.playerSpawnPoint = [
                { x: 8, y: 0 },
            ];
            this.enemySpawnPoint = [
                { x: 0, y: 24 },
                { x: 12, y: 24 },
                { x: 24, y: 24 },
            ];
            this.tileWidth = desc.tileWidth;
            this.tileHeight = desc.tileHeight;
            context.drawImage(img, 0, 0);
            let imgData = context.getImageData(0, 0, img.width, img.height);
            for (let i = 0; i < imgData.data.length; i += 4) {
                let r = imgData.data[i], g = imgData.data[i + 1], b = imgData.data[i + 2], a = imgData.data[i + 3];
                this.data.push(OCMap.decode(r, g, b));
            }
        }

        OCMap.decode = function (r, g, b) {
            if (r == 255 && g == 255 && b == 255) {
                return OCConfig.TileType.Steel;
            }
            else if (r == 0 && g == 127 && b == 0) {
                return OCConfig.TileType.Woods;
            }
            else if (r == 127 && g == 255 && b == 255) {
                return OCConfig.TileType.Ice;
            }
            else if (r == 0 && g == 127 && b == 255) {
                return OCConfig.TileType.Water;
            }
            else if (r == 127 && g == 0 && b == 0) {
                return OCConfig.TileType.Brick;
            }
            else if (r == 127 && g == 127 && b == 127) {
                return OCConfig.TileType.Solid;
            }
            else {
                return OCConfig.TileType.Null;
            }
        };

        OCMap.prototype.spawn = function (spawnee) {
            spawnee.map = this;
            this.scene.addSpriteToLayer(1, spawnee.sprite);
        }

        OCMap.prototype.draw = function () {
            let w = this.width, h = this.height;
            let tw = this.tileWidth, th = this.tileHeight;

            // Draw tiles
            for (let i = 0; i < this.data.length; i++) {
                let tile = this.data[i];
                let row = Math.floor(i / w);
                let col = i % w;
                let cx = tw * (col - 0.5 * (w - 1));
                let cy = th * (0.5 * (h - 1) - row);
                if (tile == OCConfig.TileType.Brick) {
                    let brickPos = [[cx - tw / 4, cy - th / 4], [cx + tw / 4, cy - th / 4], [cx - tw / 4, cy + th / 4], [cx + tw / 4, cy + th / 4]];
                    let brickAct = [5, 6, 6, 5];
                    for (let j = 0; j < brickPos.length; j++) {
                        let brickBit = new wesa.Sprite({
                            object: wesa.assets.objectList[1],
                            action: brickAct[j],
                            team: 0,
                            position: { x: brickPos[j][0], y: brickPos[j][1] },
                            scale: 2
                        });
                        brickBit.collision.mode = wesa.Sprite.CollisionMode.BY_ANIMATION;
                        this.scene.addSpriteToLayer(0, brickBit);
                    }
                }
                else if (tile == OCConfig.TileType.Steel) {
                    let steelBit = new wesa.Sprite({
                        object: wesa.assets.objectList[1],
                        action: OCConfig.TileType.Steel,
                        team: 0,
                        position: { x: cx, y: cy },
                        scale: 2
                    });
                    steelBit.collision.mode = wesa.Sprite.CollisionMode.BY_ANIMATION;
                    this.scene.addSpriteToLayer(0, steelBit);
                }
                else if (tile == OCConfig.TileType.Woods) {
                    this.scene.addSpriteToLayer(2, new wesa.Sprite({
                        object: wesa.assets.objectList[1],
                        action: OCConfig.TileType.Woods,
                        team: 0,
                        position: { x: cx, y: cy },
                        scale: 2
                    }));
                }
                else if (tile == OCConfig.TileType.Water) {
                    let waterBit = new wesa.Sprite({
                        object: wesa.assets.objectList[1],
                        action: OCConfig.TileType.Water,
                        team: 0,
                        position: { x: cx, y: cy },
                        scale: 2
                    });
                    waterBit.collision.mode = wesa.Sprite.CollisionMode.BY_ANIMATION;
                    this.scene.addSpriteToLayer(0, waterBit);
                }
                else if (tile == OCConfig.TileType.Ice) {
                    this.scene.addSpriteToLayer(0, new wesa.Sprite({
                        object: wesa.assets.objectList[1],
                        action: OCConfig.TileType.Ice,
                        team: 0,
                        position: { x: cx, y: cy },
                        scale: 2
                    }));
                }
                else if (tile == OCConfig.TileType.Solid) {
                    let solidBit = new wesa.Sprite({
                        object: wesa.assets.objectList[1],
                        action: OCConfig.TileType.Solid,
                        team: 0,
                        position: { x: cx, y: cy },
                        scale: 2
                    });
                    this.scene.addSpriteToLayer(0, solidBit);
                    solidBit.collision.mode = wesa.Sprite.CollisionMode.BY_ANIMATION;
                }
            }

            // Draw walls
            let wallPos = [[0, th * (h + 2) / 2], [0, -th * (h + 2) / 2], [tw * (w + 2) / 2, 0], [-tw * (w + 2) / 2, 0]];
            let wallScale = [[30, 2], [30, 2], [2, 30], [2, 30]];
            let wallColl = [[tw * w / 2, th], [tw * w / 2, th], [tw, th * h / 2], [tw, th * h / 2]];
            for (let i = 0; i < wallPos.length; i++) {
                let wall = new wesa.Sprite({
                    object: wesa.assets.objectList[1],
                    action: 7,
                    team: 0,
                    position: { x: wallPos[i][0], y: wallPos[i][1] },
                    scale: { x: wallScale[i][0], y: wallScale[i][1] }
                });
                wall.collision.hurt = {
                    shape: wesa.Sprite.CollisionShape.RECT,
                    x1Relative: -wallColl[i][0],
                    x2Relative: wallColl[i][0],
                    y1Relative: -wallColl[i][1],
                    y2Relative: wallColl[i][1]
                };
                this.scene.addSpriteToLayer(0, wall);
            }

            // Spawn
            // map.spawn(new OC.Eagle({
            //     scene: scene,
            //     position: { x: 0, y: -192 }
            // }));
            // let playerTank = new OC.Tank({
            //     type: OC.config.TankType.Player,
            //     team: OC.config.Team.Player,
            //     position: { x: -64, y: -192 },
            //     speed: 1
            // });
            // map.spawn(playerTank);

        };


        function OCTank(desc) {
            let me = this;
            me.speed = desc.speed;
            me.sprite = new wesa.Sprite({
                object: wesa.assets.objectList[desc.type],
                action: 8,
                team: desc.team,
                position: { x: desc.position.x, y: desc.position.y },
                scale: 2
            });
            let snap = function (val, gridSize, tolerance) {
                let norm = val / gridSize;
                let frac = norm - Math.floor(norm);
                if (frac >= tolerance / gridSize && frac <= 1 - tolerance / gridSize) {
                    return val;
                }
                else {
                    return Math.round(val / gridSize) * gridSize;
                }
            };
            let basicAI = new wesa.AI();
            basicAI.execute = function () {
                let s = this.self;
                if (s.velocity.x < 0) {
                    s.changeAction(5, {
                        isSmart: true,
                        isImmediate: true
                    });
                    s.position.y = snap(s.position.y, me.map.tileHeight, me.map.tileHeight / 4);
                }
                else if (s.velocity.x > 0) {
                    s.changeAction(7, {
                        isSmart: true,
                        isImmediate: true
                    });
                    s.position.y = snap(s.position.y, me.map.tileHeight, me.map.tileHeight / 4);
                }
                else if (s.velocity.y < 0) {
                    s.changeAction(6, {
                        isSmart: true,
                        isImmediate: true
                    });
                    s.position.x = snap(s.position.x, me.map.tileWidth, me.map.tileWidth / 4);
                }
                else if (s.velocity.y > 0) {
                    s.changeAction(4, {
                        isSmart: true,
                        isImmediate: true
                    });
                    s.position.x = snap(s.position.x, me.map.tileWidth, me.map.tileWidth / 4);
                }
                else if (s.action < 8) {
                    s.changeAction(s.action % 4, {
                        isSmart: true,
                        isImmediate: true
                    });
                }
            }
            me.sprite.addAI(basicAI);
            switch (desc.type) {
                case OCConfig.TankType.Player:

                    let ai = new wesa.AI();
                    ai.execute = function () {

                    };
                    this.sprite.addAI(ai);


                    break;
                case OCConfig.TankType.Light:

                    break;
                case OCConfig.TankType.Agile:

                    break;
                case OCConfig.TankType.Power:

                    break;
                case OCConfig.TankType.Heavy:

                    break;
                default:
                    break;
            }
            this.sprite.backref = this;
            this.sprite.collision.mode = wesa.Sprite.CollisionMode.BY_ANIMATION;
            this.cooldown = 0;
        }

        OCTank.prototype.fire = function () {
            let s = this.sprite;
            let dir = s.action % 4;
            let posOffset, act, v;
            if (dir == 0) {
                act = 0;
                posOffset = [0, 10];
                v = [0, 5];
            }
            else if (dir == 1) {
                act = 1;
                posOffset = [-10, 0];
                v = [-5, 0];
            }
            else if (dir == 2) {
                act = 2;
                posOffset = [0, -10];
                v = [0, -5];
            }
            else if (dir == 3) {
                act = 3;
                posOffset = [10, 0];
                v = [5, 0];
            }
            let bullet = new OCBullet({
                action: act,
                team: this.sprite.team,
                position: { x: s.position.x + posOffset[0], y: s.position.y + posOffset[1] }
            })
            bullet.sprite.velocity.x = v[0];
            bullet.sprite.velocity.y = v[1];
            s.scene.addSpriteToLayer(1, bullet.sprite);
        };

        OCTank.prototype.die = function () {
            let s = this.sprite;
            s.scene.addSpriteToLayer(3, new wesa.Sprite({
                object: wesa.assets.objectList[2],
                action: 5,
                team: 0,
                position: { x: s.position.x, y: s.position.y },
                scale: 2
            }));
            s.kill();
        }


        function OCEagle(desc) {
            this.sprite = new wesa.Sprite({
                object: wesa.assets.objectList[7],
                action: 0,
                team: OCConfig.Team.Enemy,
                position: { x: desc.position.x, y: desc.position.y },
                scale: 2
            });
            this.sprite.backref = this;
            this.sprite.collision.mode = wesa.Sprite.CollisionMode.BY_ANIMATION;
            this.cooldown = 0;
        }

        OCEagle.prototype.die = function () {
            let s = this.sprite;
            s.scene.addSpriteToLayer(3, new wesa.Sprite({
                object: wesa.assets.objectList[2],
                action: 5,
                team: 0,
                position: { x: s.position.x, y: s.position.y },
                scale: 2
            }));
            s.collision.hurt = null;
            s.changeAction(1);
        }


        function OCBullet(desc) {
            this.sprite = new wesa.Sprite({
                object: wesa.assets.objectList[2],
                action: desc.action,
                team: desc.team,
                position: { x: desc.position.x, y: desc.position.y },
                scale: 2
            });
            this.sprite.backref = this;
            this.sprite.collision.mode = wesa.Sprite.CollisionMode.BY_ANIMATION;
        }

        OCBullet.prototype.hit = function () {
            let s = this.sprite;
            s.scene.addSpriteToLayer(3, new wesa.Sprite({
                object: wesa.assets.objectList[2],
                action: 4,
                team: 0,
                position: { x: s.position.x, y: s.position.y },
                scale: 2
            }));
            s.changeAction(s.action % 2 + 6, {
                isSmart: false,
                isImmediate: false
            });
        }


        return {

            Map: OCMap,
            Tank: OCTank,
            Eagle: OCEagle,

            config: OCConfig

        };

    }

    if (typeof(window.OC) === 'undefined'){
        window.OC = OpenCity();
    }

}) (window, wesa);
