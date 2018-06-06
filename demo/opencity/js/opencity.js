(function (window, wesa) {
    'use strict'

    function OpenCity () {

        const OCConfig = Object.freeze({
            Team: {
                Null: 0,
                Player: 1,
                Enemy: 2
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
            Objects: {
                LightEnemyTank: 1,
                FastEnemyTank: 2,
                PowerEnemyTank: 3,
                ArmoredEnemyTank: 4,
                PlayerTank: 10,
                Eagle: 20,
                StationaryObject: 100,
                MobileObject: 101
            },
            CollisionMatrix: [
                [true, true, false],
                [false, false, false],
                [true, true, true]
            ]
        });

        const OCReference = {
            player: null,
            eagle: null,
            enemies: [],
            enemySpawners: [],
            keyStatus: {
                up: false,
                down: false,
                left: false,
                right: false,
                fire: false
            },
            playerRespawnCount: 2,
            score: 0,
            isGameOver: false
        };

        function snap(val, gridSize, tolerance) {
            let norm = val / gridSize;
            let frac = norm - Math.floor(norm);
            if (frac >= tolerance / gridSize && frac <= 1 - tolerance / gridSize) {
                return val;
            }
            else {
                return Math.round(val / gridSize) * gridSize;
            }
        }

        function move(t, p) {
            // up, down, left, right
            for (let i = 1; i <= 3; i++) { p[i] += p[i - 1]; }
            let s = t.sprite;
            let r = Math.random();
            if (r < p[0]) {
                s.velocity.x = 0;
                s.velocity.y = t.speed;
            }
            else if (r < p[1]) {
                s.velocity.x = 0;
                s.velocity.y = -t.speed;
            }
            else if (r < p[2]) {
                s.velocity.x = -t.speed;
                s.velocity.y = 0;
            }
            else if (r < p[3]) {
                s.velocity.x = t.speed;
                s.velocity.y = 0;
            }
        }

        const OCAI = {
            Universal: function () {
                let ai = new wesa.AI();
                ai.execute = function () {
                    let s = this.self;
                    let armor = s.backref.armor;
                    let map = s.backref.map;
                    if (s.velocity.x < 0) {
                        s.changeAction(armor * 10 + 5, {
                            isSmart: true,
                            isImmediate: true
                        });
                        s.position.y = snap(s.position.y, map.tileHeight, map.tileHeight / 4);
                    }
                    else if (s.velocity.x > 0) {
                        s.changeAction(armor * 10 + 7, {
                            isSmart: true,
                            isImmediate: true
                        });
                        s.position.y = snap(s.position.y, map.tileHeight, map.tileHeight / 4);
                    }
                    else if (s.velocity.y < 0) {
                        s.changeAction(armor * 10 + 6, {
                            isSmart: true,
                            isImmediate: true
                        });
                        s.position.x = snap(s.position.x, map.tileWidth, map.tileWidth / 4);
                    }
                    else if (s.velocity.y > 0) {
                        s.changeAction(armor * 10 + 4, {
                            isSmart: true,
                            isImmediate: true
                        });
                        s.position.x = snap(s.position.x, map.tileWidth, map.tileWidth / 4);
                    }
                    else if (s.action < 40) {
                        s.changeAction(s.action % 4, {
                            isSmart: true,
                            isImmediate: true
                        });
                    }
                };
                return ai;
            },
            EnemyTank: function () {
                let ai = new wesa.AI();
                ai.tick = 2;
                ai.reload = 30;
                ai.target = OCReference.eagle.sprite;
                ai.execute = function () {
                    let self = this.self;

                    // Movement control
                    if ((self.prevPosition.x == self.position.x && self.prevPosition.y == self.position.y) || this.tick == 0) {
                        let target = this.target;
                        let dx = self.position.x - target.position.x;
                        let dy = self.position.y - target.position.y;
                        let xPortion = 0.2 + 0.6 * (Math.abs(dx) / (Math.abs(dx) + Math.abs(dy)));
                        let yPortion = 1 - xPortion;
                        let left, right, up, down;
                        if (dx < 0) {
                            right = 0.8 * xPortion;
                            left = 0.2 * xPortion;
                        }
                        else {
                            right = 0.2 * xPortion;
                            left = 0.8 * xPortion;
                        }
                        if (dy < 0) {
                            up = 0.8 * yPortion;
                            down = 0.2 * yPortion;
                        }
                        else {
                            up = 0.2 * yPortion;
                            down = 0.8 * yPortion;
                        }
                        if (self.action < 40) {
                            move(self.backref, [up, down, left, right]);
                        }

                        // Got stuck, try shoot a way out
                        if (this.tick > 0) {
                            if (this.reload < 15) {
                                self.backref.fire();
                                this.reload = 50;
                            }
                        }

                        this.tick = 30;
                    }
                    else {
                        this.tick--;
                    }

                    // Fire control
                    if (this.reload == 0) {
                        if (Math.random() < 0.6) {
                            self.backref.fire();
                            this.reload = 50;
                        }
                        else {
                            this.reload = 15;
                        }
                    }
                    else {
                        this.reload--;
                    }

                };
                return ai;
            }
        };

        const OCFunctions = {
            processCollision: function (collisions) {
                for (let i = 0; i < OCReference.enemySpawners.length; i++) {
                    OCReference.enemySpawners[i].isBlocked = false;
                }
                for (let i = 0; i < collisions.length; i++) {
                    let hitter = collisions[i].hitter, hurter = collisions[i].hurter;

                    // Tank collides with stationary
                    if (hitter.object.type == OCConfig.ObjectType.Tank && hurter.object.type == OCConfig.ObjectType.Stationary) {
                        hitter.position.x = hitter.prevPosition.x;
                        hitter.position.y = hitter.prevPosition.y;
                    }

                    // Tank collides with tank
                    else if (hitter.object.type == OCConfig.ObjectType.Tank && hurter.object.type == OCConfig.ObjectType.Tank) {
                        hitter.position.x = hitter.prevPosition.x;
                        hitter.position.y = hitter.prevPosition.y;
                    }

                    // Mobile hits
                    else if (hitter.team != hurter.team && hitter.object.type == OCConfig.ObjectType.Mobile) {

                        // Bullet (action < 4) hits
                        if (hitter.action < 4) {

                            // Ignores water
                            if (!(hurter.object.type == OCConfig.ObjectType.Stationary && hurter.action == OCConfig.TileType.Water)) {
                                hitter.velocity.x = 0;
                                hitter.velocity.y = 0;
                                hitter.backref.hit();
                            }

                            // Hits tank or eagle
                            if (hurter.object.type == OCConfig.ObjectType.Tank && hurter.action < 40) {
                                if (hurter.backref.armor <= 0) {
                                    hurter.backref.die();
                                }
                                else {
                                    hurter.backref.armor--;
                                }
                            }

                        }

                        // Explosion of bullet hits stationary
                        else if (hitter.action >= 6 && hitter.action <= 7 && hurter.object.type == OCConfig.ObjectType.Stationary) {

                            // Brick wall is hit
                            if (hurter.action == 5 || hurter.action == 6) {
                                hurter.kill();
                            }

                        }

                        // Enemy Spawner is blocked by some tank
                        else if (hitter.action == 8 && hurter.object.type == OCConfig.ObjectType.Tank) {
                            hitter.backref.isBlocked = true;
                        }

                    }
                }
            },
            gameOver: function () {
                OCReference.isGameOver = true;
                if (OCReference.player) {
                    OCReference.player.sprite.velocity.x = 0;
                    OCReference.player.sprite.velocity.y = 0;
                    OCReference.player = null;
                }
            }
        };


        function OCMap(desc) {
            this.scene = desc.scene;
            this.tileWidth = desc.tileWidth;
            this.tileHeight = desc.tileHeight;
            this.eagleSpawnPoint = { row: 0, col: 12 };
            this.playerSpawnPoint = { row: 0, col: 8 };
            this.enemySpawnPoint = [
                { row: 24, col: 0 },
                { row: 24, col: 12 },
                { row: 24, col: 24 },
            ];
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

        OCMap.prototype.load = function (img) {
            let canvas = document.createElement('canvas');
            let context = canvas.getContext('2d');
            this.width = canvas.width = img.naturalWidth;
            this.height = canvas.height = img.naturalHeight;
            context.drawImage(img, 0, 0);
            let imgData = context.getImageData(0, 0, img.width, img.height);
            this.data = [];
            for (let i = 0; i < imgData.data.length; i += 4) {
                let r = imgData.data[i], g = imgData.data[i + 1], b = imgData.data[i + 2], a = imgData.data[i + 3];
                this.data.push(OCMap.decode(r, g, b));
            }
        };

        OCMap.prototype.spawnEagle = function () {
            let w = this.width, h = this.height;
            let tw = this.tileWidth, th = this.tileHeight;
            let eagle = new OCEagle({
                team: OCConfig.Team.Null,
                position: { x: tw * (1 + this.eagleSpawnPoint.col - w / 2), y: th * (1 + this.eagleSpawnPoint.row - h / 2) }
            });
            eagle.map = this;
            eagle.armor = 0;
            this.scene.addSpriteToLayer(1, eagle.sprite);
            OCReference.eagle = eagle;
        };

        OCMap.prototype.spawnPlayer = function () {
            let w = this.width, h = this.height;
            let tw = this.tileWidth, th = this.tileHeight;
            let player = new OCTank({
                type: OCConfig.Objects.PlayerTank,
                team: OCConfig.Team.Player,
                position: { x: tw * (1 + this.playerSpawnPoint.col - w / 2), y: th * (1 + this.playerSpawnPoint.row - h / 2) },
                speed: 1
            });
            player.map = this;
            this.scene.addSpriteToLayer(1, player.sprite);
            OCReference.player = player;
        };

        OCMap.prototype.spawnEnemy = function (enemyType, enemySpawnPoint) {
            let w = this.width, h = this.height;
            let tw = this.tileWidth, th = this.tileHeight;
            let enemy = new OCTank({
                type: enemyType,
                team: OCConfig.Team.Enemy,
                position: { x: tw * (1 + this.enemySpawnPoint[enemySpawnPoint].col - w / 2), y: th * (1 + this.enemySpawnPoint[enemySpawnPoint].row - h / 2) }
            });
            switch (enemyType) {
                case OCConfig.Objects.LightEnemyTank:
                    break;
                case OCConfig.Objects.FastEnemyTank:
                    enemy.speed = 2;
                    break;
                case OCConfig.Objects.PowerEnemyTank:
                    enemy.bulletSpeed = 8;
                    break;
                case OCConfig.Objects.ArmoredEnemyTank:
                    enemy.armor = 3;
                    break;
                default:
                    console.error('OpenCity: Unknown spawning enemy type.');
                    return;
            }
            enemy.map = this;
            this.scene.addSpriteToLayer(1, enemy.sprite);
            OCReference.enemies.push(enemy);
        };

        OCMap.prototype.addEnemySpawners = function () {
            let w = this.width, h = this.height;
            let tw = this.tileWidth, th = this.tileHeight;
            for (let i = 0; i < this.enemySpawnPoint.length; i++) {
                let spawner = new OCEnemySpawner({
                    position: { x: tw * (1 + this.enemySpawnPoint[i].col - w / 2), y: th * (1 + this.enemySpawnPoint[i].row - h / 2) },
                    id: i
                });
                this.scene.addSpriteToLayer(1, spawner.sprite);
                OCReference.enemySpawners.push(spawner);
            }
        };

        OCMap.prototype.reset = function () {
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
                            object: wesa.assets.storedObjects[OCConfig.Objects.StationaryObject],
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
                        object: wesa.assets.storedObjects[OCConfig.Objects.StationaryObject],
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
                        object: wesa.assets.storedObjects[OCConfig.Objects.StationaryObject],
                        action: OCConfig.TileType.Woods,
                        team: 0,
                        position: { x: cx, y: cy },
                        scale: 2
                    }));
                }
                else if (tile == OCConfig.TileType.Water) {
                    let waterBit = new wesa.Sprite({
                        object: wesa.assets.storedObjects[OCConfig.Objects.StationaryObject],
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
                        object: wesa.assets.storedObjects[OCConfig.Objects.StationaryObject],
                        action: OCConfig.TileType.Ice,
                        team: 0,
                        position: { x: cx, y: cy },
                        scale: 2
                    }));
                }
                else if (tile == OCConfig.TileType.Solid) {
                    let solidBit = new wesa.Sprite({
                        object: wesa.assets.storedObjects[OCConfig.Objects.StationaryObject],
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
                    object: wesa.assets.storedObjects[OCConfig.Objects.StationaryObject],
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

            // Clear references
            OCReference.enemies = [];
            OCReference.enemySpawners = [];

            // Spawn Things
            this.spawnEagle();
            this.spawnPlayer();
            this.addEnemySpawners();

        };

        OCMap.prototype.trySpawnEnemy = function () {
            if (OCReference.enemies.length < 4) {
                let spawnPoint = Math.floor(Math.random() * this.enemySpawnPoint.length);
                if (!OCReference.enemySpawners[spawnPoint].isBlocked) {
                    let x = Math.random();
                    if (x < 0.25) {
                        this.spawnEnemy(OCConfig.Objects.LightEnemyTank, spawnPoint);
                    }
                    else if (x < 0.5) {
                        this.spawnEnemy(OCConfig.Objects.FastEnemyTank, spawnPoint);
                    }
                    else if (x < 0.75) {
                        this.spawnEnemy(OCConfig.Objects.PowerEnemyTank, spawnPoint);
                    }
                    else {
                        this.spawnEnemy(OCConfig.Objects.ArmoredEnemyTank, spawnPoint);
                    }
                }
            }
        };


        function OCTank(desc) {
            let me = this;
            me.type = desc.type;
            me.speed = (desc.hasOwnProperty('speed') ? desc.speed : 1);
            me.bulletSpeed = (desc.hasOwnProperty('bulletSpeed') ? desc.bulletSpeed : 5);
            me.armor = (desc.hasOwnProperty('armor') ? desc.armor : 0);
            me.sprite = new wesa.Sprite({
                object: wesa.assets.storedObjects[me.type],
                action: 40,
                team: desc.team,
                position: { x: desc.position.x, y: desc.position.y },
                scale: 2
            });
            me.sprite.backref = this;
            me.sprite.addAI(OCAI.Universal());
            switch (me.type) {
                case OCConfig.Objects.LightEnemyTank:
                case OCConfig.Objects.FastEnemyTank:
                case OCConfig.Objects.PowerEnemyTank:
                case OCConfig.Objects.ArmoredEnemyTank:
                    me.sprite.addAI(OCAI.EnemyTank());
                    break;
                default:
                    break;
            }
            this.sprite.collision.mode = wesa.Sprite.CollisionMode.BY_ANIMATION;
            this.cooldown = 0;
        }

        OCTank.prototype.takeControl = function (keyStatus) {
            if (this.type == OCConfig.Objects.PlayerTank && this.sprite.action < 8) {
                let s = this.sprite;
                if (keyStatus.left && !keyStatus.right) {
                    s.velocity.x = -this.speed;
                    s.velocity.y = 0;
                }
                else if (!keyStatus.left && keyStatus.right) {
                    s.velocity.x = this.speed;
                    s.velocity.y = 0;
                }
                else if (keyStatus.up && !keyStatus.down) {
                    s.velocity.x = 0;
                    s.velocity.y = this.speed;
                }
                else if (!keyStatus.up && keyStatus.down) {
                    s.velocity.x = 0;
                    s.velocity.y = -this.speed;
                }
                else {
                    if (s.action >= 4 && s.action <= 7) {
                        s.velocity.x = 0;
                        s.velocity.y = 0;
                    }
                }
                if (this.cooldown > 0) { this.cooldown--; }
                if (this.cooldown == 0 && keyStatus.fire) {
                    this.fire();
                    this.cooldown = 40;
                }
            }
        };

        OCTank.prototype.fire = function () {
            let s = this.sprite;
            if (s.action >= 40) { return; }
            let dir = s.action % 10 % 4;
            let posOffset, act, v;
            if (dir == 0) {
                act = 0;
                posOffset = [0, 10];
                v = [0, this.bulletSpeed];
            }
            else if (dir == 1) {
                act = 1;
                posOffset = [-10, 0];
                v = [-this.bulletSpeed, 0];
            }
            else if (dir == 2) {
                act = 2;
                posOffset = [0, -10];
                v = [0, -this.bulletSpeed];
            }
            else if (dir == 3) {
                act = 3;
                posOffset = [10, 0];
                v = [this.bulletSpeed, 0];
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
                object: wesa.assets.storedObjects[OCConfig.Objects.MobileObject],
                action: 5,
                team: 0,
                position: { x: s.position.x, y: s.position.y },
                scale: 2
            }));
            s.kill();

            let isEnemy = true;
            let scoreAction = null;

            switch (this.type) {
                case OCConfig.Objects.PlayerTank:
                    isEnemy = false;
                    break;
                case OCConfig.Objects.LightEnemyTank:
                    scoreAction = 9;
                    OCReference.score += 100;
                    break;
                case OCConfig.Objects.FastEnemyTank:
                    scoreAction = 10;
                    OCReference.score += 200;
                    break;
                case OCConfig.Objects.PowerEnemyTank:
                    scoreAction = 11;
                    OCReference.score += 300;
                    break;
                case OCConfig.Objects.ArmoredEnemyTank:
                    scoreAction = 12;
                    OCReference.score += 400;
                    break;
                default:
                    break;
            }

            if (isEnemy) {
                let i = OCReference.enemies.indexOf(this);
                if (i >= 0) { OCReference.enemies.splice(i, 1); }
                s.scene.addSpriteToLayer(2, new wesa.Sprite({
                    object: wesa.assets.storedObjects[OCConfig.Objects.MobileObject],
                    action: scoreAction,
                    team: 0,
                    position: { x: s.position.x, y: s.position.y },
                    scale: 2
                }));
            }
            else {
                if (OCReference.playerRespawnCount > 0) {
                    OCReference.player.map.spawnPlayer();
                    OCReference.playerRespawnCount--;
                }
                else {
                    OCFunctions.gameOver();
                }
            }
        }


        function OCEagle(desc) {
            this.sprite = new wesa.Sprite({
                object: wesa.assets.storedObjects[OCConfig.Objects.Eagle],
                action: 0,
                team: desc.team,
                position: { x: desc.position.x, y: desc.position.y },
                scale: 2
            });
            this.sprite.backref = this;
            this.sprite.collision.mode = wesa.Sprite.CollisionMode.BY_ANIMATION;
        }

        OCEagle.prototype.die = function () {
            let s = this.sprite;
            s.scene.addSpriteToLayer(3, new wesa.Sprite({
                object: wesa.assets.storedObjects[OCConfig.Objects.MobileObject],
                action: 5,
                team: 0,
                position: { x: s.position.x, y: s.position.y },
                scale: 2
            }));
            s.collision.hurt = null;
            s.changeAction(1, {
                isSmart: true,
                isImmediate: true
            });
            OCFunctions.gameOver();
        }


        function OCEnemySpawner(desc) {
            this.sprite = new wesa.Sprite({
                object: wesa.assets.storedObjects[OCConfig.Objects.MobileObject],
                action: 8,
                team: OCConfig.Team.Null,
                position: { x: desc.position.x, y: desc.position.y },
                scale: 1
            });
            this.id = desc.id;
            this.isBlocked = false;
            this.sprite.backref = this;
            this.sprite.collision.mode = wesa.Sprite.CollisionMode.BY_ANIMATION;
        }


        function OCBullet(desc) {
            this.sprite = new wesa.Sprite({
                object: wesa.assets.storedObjects[OCConfig.Objects.MobileObject],
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
                object: wesa.assets.storedObjects[OCConfig.Objects.MobileObject],
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
            config: OCConfig,
            ref: OCReference,
            func: OCFunctions
        };

    }

    if (typeof(window.OC) === 'undefined'){
        window.OC = OpenCity();
    }

}) (window, wesa);
