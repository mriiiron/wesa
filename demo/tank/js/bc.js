(function (window, wesa) {
    'use strict'

    function BC() {

        let BCTeam = Object.freeze({
            Null: 0,
            Player: 1,
            Enemy: 2
        });

        let BCTankType = Object.freeze({
            Player: 0,
            Light: 3,
            Agile: 4,
            Power: 5,
            Heavy: 6
        });

        let BCTileType = Object.freeze({
            Null: 0,
            Steel: 1,
            Woods: 2,
            Ice: 3,
            Water: 4,
            Brick: 5
        });

        function BCMap(desc) {
            let img = document.getElementById(desc.imgID);
            let canvas = document.createElement('canvas');
            let context = canvas.getContext('2d');
            this.scene = desc.scene;
            this.width = canvas.width = img.naturalWidth;
            this.height = canvas.height = img.naturalHeight;
            this.data = [];
            this.tileWidth = desc.tileWidth;
            this.tileHeight = desc.tileHeight;
            context.drawImage(img, 0, 0);
            let imgData = context.getImageData(0, 0, img.width, img.height);
            for (let i = 0; i < imgData.data.length; i += 4) {
                let r = imgData.data[i], g = imgData.data[i + 1], b = imgData.data[i + 2], a = imgData.data[i + 3];
                this.data.push(BCMap.decode(r, g, b));
            }
        }

        BCMap.decode = function (r, g, b) {
            if (r == 255 && g == 255 && b == 255) {
                return BCTileType.Steel;
            }
            else if (r == 0 && g == 127 && b == 0) {
                return BCTileType.Woods;
            }
            else if (r == 127 && g == 127 && b == 127) {
                return BCTileType.Ice;
            }
            else if (r == 0 && g == 127 && b == 255) {
                return BCTileType.Water;
            }
            else if (r == 127 && g == 0 && b == 0) {
                return BCTileType.Brick;
            }
            else {
                return BCTileType.Null;
            }
        };

        BCMap.prototype.draw = function () {
            let w = this.width, h = this.height;
            let tw = this.tileWidth, th = this.tileHeight;
            for (let i = 0; i < this.data.length; i++) {
                let tile = this.data[i];
                let row = Math.floor(i / w);
                let col = i % w;
                let cx = tw * (col - 0.5 * (w - 1));
                let cy = th * (0.5 * (h - 1) - row);
                if (tile == BCTileType.Brick) {
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
                        brickBit.collision.hit = {
                            shape: wesa.Sprite.CollisionShape.RECT,
                            x1Relative: -4,
                            x2Relative: 4,
                            y1Relative: -4,
                            y2Relative: 4
                        };
                        brickBit.collision.hurt = {
                            shape: wesa.Sprite.CollisionShape.RECT,
                            x1Relative: -4,
                            x2Relative: 4,
                            y1Relative: -4,
                            y2Relative: 4
                        };
                        this.scene.addSpriteToLayer(0, brickBit);
                    }
                }
                else if (tile == BCTileType.Steel) {
                    let steelBit = new wesa.Sprite({
                        object: wesa.assets.objectList[1],
                        action: BCTileType.Steel,
                        team: 0,
                        position: { x: cx, y: cy },
                        scale: 2
                    });
                    steelBit.collision.hit = {
                        shape: wesa.Sprite.CollisionShape.RECT,
                        x1Relative: -8,
                        x2Relative: 8,
                        y1Relative: -8,
                        y2Relative: 8
                    };
                    steelBit.collision.hurt = {
                        shape: wesa.Sprite.CollisionShape.RECT,
                        x1Relative: -8,
                        x2Relative: 8,
                        y1Relative: -8,
                        y2Relative: 8
                    };
                    this.scene.addSpriteToLayer(0, steelBit);
                }
                else if (tile == BCTileType.Woods) {
                    this.scene.addSpriteToLayer(2, new wesa.Sprite({
                        object: wesa.assets.objectList[1],
                        action: BCTileType.Woods,
                        team: 0,
                        position: { x: cx, y: cy },
                        scale: 2
                    }));
                }
                else if (tile == BCTileType.Water) {
                    let waterBit = new wesa.Sprite({
                        object: wesa.assets.objectList[1],
                        action: BCTileType.Water,
                        team: 0,
                        position: { x: cx, y: cy },
                        scale: 2
                    });
                    waterBit.collision.hit = {
                        shape: wesa.Sprite.CollisionShape.RECT,
                        x1Relative: -8,
                        x2Relative: 8,
                        y1Relative: -8,
                        y2Relative: 8
                    };
                    this.scene.addSpriteToLayer(0, waterBit);
                }
                else if (tile == BCTileType.Ice) {
                    this.scene.addSpriteToLayer(0, new wesa.Sprite({
                        object: wesa.assets.objectList[1],
                        action: BCTileType.Ice,
                        team: 0,
                        position: { x: cx, y: cy },
                        scale: 2
                    }));
                }
            }
        };


        function BCTank(desc) {
            this.scene = desc.scene;
            this.speed = desc.speed;
            this.sprite = new wesa.Sprite({
                object: wesa.assets.objectList[desc.type],
                action: 8,
                team: desc.team,
                position: { x: desc.position.x, y: desc.position.y },
                scale: 2
            });

            let basicAI = new wesa.AI();
            basicAI.execute = function () {
                let s = this.self;
                if (s.velocity.x < 0) {
                    s.changeAction(5, true, true);
                }
                else if (s.velocity.x > 0) {
                    s.changeAction(7, true, true);
                }
                else if (s.velocity.y < 0) {
                    s.changeAction(6, true, true);
                }
                else if (s.velocity.y > 0) {
                    s.changeAction(4, true, true);
                }
                else {
                    s.changeAction(s.action % 4, true, true);
                }
            }
            this.sprite.addAI(basicAI);

            switch (desc.type) {
                case BCTankType.Player:

                    let ai = new wesa.AI();
                    ai.execute = function () {
                        
                    };
                    this.sprite.addAI(ai);


                    break;
                case BCTankType.Light:

                    break;
                case BCTankType.Agile:

                    break;
                case BCTankType.Power:

                    break;
                case BCTankType.Heavy:

                    break;
                default:
                    break;
            }
            this.sprite.backref = this;
            this.sprite.collision.mode = wesa.Sprite.CollisionMode.BY_ANIMATION;
            this.cooldown = 0;
        }

        BCTank.prototype.fire = function () {
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
            let bullet = new wesa.Sprite({
                object: wesa.assets.objectList[2],
                action: act,
                team: this.sprite.team,
                position: { x: s.position.x + posOffset[0], y: s.position.y + posOffset[1] },
                scale: 2
            });
            bullet.velocity.x = v[0];
            bullet.velocity.y = v[1];
            bullet.collision.mode = wesa.Sprite.CollisionMode.BY_ANIMATION;
            this.scene.addSpriteToLayer(1, bullet);
        };

        BCTank.prototype.die = function () {
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

        BCTank.prototype.spawn = function () {
            this.scene.addSpriteToLayer(1, this.sprite);
        }


        function BCEagle(desc) {
            this.scene = desc.scene;
            this.sprite = new wesa.Sprite({
                object: wesa.assets.objectList[7],
                action: 0,
                team: BCTeam.Enemy,
                position: { x: desc.position.x, y: desc.position.y },
                scale: 2
            });
            this.sprite.backref = this;
            this.sprite.collision.mode = wesa.Sprite.CollisionMode.BY_ANIMATION;
            this.cooldown = 0;
        }

        BCEagle.prototype.die = function () {
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

        BCEagle.prototype.draw = function () {
            this.scene.addSpriteToLayer(1, this.sprite);
        }


        return {

            Map: BCMap,
            Tank: BCTank,
            Eagle: BCEagle,

            Team: BCTeam,
            TankType: BCTankType,
            TileType: BCTileType

        };

    }

    if (typeof(window.BC) === 'undefined'){
        window.BC = BC();
    }

}) (window, wesa);
