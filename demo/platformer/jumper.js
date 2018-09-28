(function (window, wesa) {
    'use strict'

    function Jumper () {

        const keyStatus = {
            jump: false
        };

        const gameObjects = {
            player: null,
            pillars: null
        };

        const util = {
            processPlatformCollisions: function (collisions) {
                for (let i = 0; i < collisions.length; i++) {
                    let c = collisions[i];
                    if (c.sprite.velocity.y < -4) {
                        c.sprite.changeAction(2, {
                            isSmart: true,
                            isImmediate: true
                        });
                    }
                    else {
                        c.sprite.changeAction(0, {
                            isSmart: true,
                            isImmediate: true
                        });
                    }
                    c.sprite.platform = c.platform;
                    c.sprite.position.y = c.collisionPoint.y;
                    c.sprite.velocity.y = 0;
                    c.sprite.acceleration.y = 0;
                }
            }
        };

        function Jumper(desc) {
            this.scene = desc.scene;
            this.sprite = new wesa.Sprite({
                object: wesa.assets.storedObjects[0],
                action: 0,
                position: { x: desc.x, y: desc.y },
                scale: 2
            });
            this.sprite.flags.platformCollisionCheck = true;
            this.gravity = -0.25;
            this.jumpForce = 0;
            let me = this;
            let ai = new wesa.AI();
            let borderBottom = -140;
            ai.execute = function () {
                let s = this.self;
                if (s.platform == null) {
                    s.acceleration.y = me.gravity;
                    if (s.velocity.y > 1) {
                        s.changeAction(3, {
                            isSmart: true,
                            isImmediate: true
                        });
                    }
                    else if (s.velocity.y < -1) {
                        s.changeAction(5, {
                            isSmart: true,
                            isImmediate: true
                        });
                    }
                    else {
                        s.changeAction(4, {
                            isSmart: true,
                            isImmediate: true
                        });
                    }
                    if (s.position.y < borderBottom) {
                        

                        // Game Over

                    }
                }
                else {
                    s.acceleration.y = 0;
                }
            };
            this.sprite.addAI(ai);
            this.scene.addSpriteToLayer(0, this.sprite);
        }

        Jumper.prototype.processInput = function (keyStatus) {
            let s = this.sprite;
            if (s.platform) {
                if (keyStatus.jump) {
                    if (this.jumpForce == 0) {
                        this.jumpReady();
                    }
                    if (this.jumpForce < 10) {
                        this.jumpForce += 0.2;
                    }
                }
                else {
                    if (this.jumpForce > 2) {
                        this.jump();
                    }
                    else if (this.jumpForce > 0) {
                        this.jumpCancel();
                    }
                    this.jumpForce = 0;
                }

            }
        };

        Jumper.prototype.jumpReady = function () {
            this.sprite.changeAction(1, {
                isSmart: true,
                isImmediate: true
            });
        };

        Jumper.prototype.jumpCancel = function () {
            this.sprite.changeAction(0, {
                isSmart: true,
                isImmediate: true
            });
        }

        Jumper.prototype.jump = function () {
            let s = this.sprite;
            s.platform = null;
            s.velocity.y = this.jumpForce;
            this.sprite.changeAction(0, {
                isSmart: true,
                isImmediate: true
            });
        };


        function Pillar(desc) {
            this.scene = desc.scene;
            this.vx = 0;
            this.supportSprite = [];
            let unitHeight = 32, borderBottom = -120;

            // Add top part
            this.topSprite = new wesa.Sprite({
                object: wesa.assets.storedObjects[1],
                action: 0,
                position: { x: desc.x, y: desc.platformY},
                scale: 2
            });
            this.scene.addSpriteToLayer(0, this.topSprite);

            // Add support part
            let y = desc.platformY - unitHeight;
            while (y > borderBottom) {
                let s = new wesa.Sprite({
                    object: wesa.assets.storedObjects[1],
                    action: 1,
                    position: { x: desc.x, y: y},
                    scale: 2
                });
                this.supportSprite.push(s);
                this.scene.addSpriteToLayer(0, s);
                y -= unitHeight;
            }

            // Add logical platform
            this.platform = new wesa.platform.Simple({
                position: { x: desc.x - unitHeight, y: desc.platformY },
                length: unitHeight * 2
            });
            this.scene.addPlatform(this.platform);
        }

        Pillar.prototype.x = function () {
            return this.topSprite.position.x;
        };
    
        Pillar.prototype.update = function () {
            for (let i = 0; i < this.supportSprite.length; i++) {
                this.supportSprite[i].velocity.x = this.vx;
            }
            this.topSprite.velocity.x = this.vx;
            this.platform.velocity.x = this.vx;
        };
    
        Pillar.prototype.destroy = function () {
            this.topSprite.kill();
            for (let i = 0; i < this.supportSprite.length; i++) {
                this.supportSprite[i].kill();
            }
            this.platform.kill();
        };


        function Pillars(desc) {
            this.scene = desc.scene;
            this.xStart = desc.xStart;
            this.minInterval = desc.minInterval;
            this.maxInterval = desc.maxInterval;
            this.minPlatformY = desc.minPlatformY;
            this.maxPlatformY = desc.maxPlatformY;
            this.pillarSpeed = desc.pillarSpeed;
            this.lastPillar = null;
            this.isMoving = false;
            this.items = [];
            this.borderLeft = -200;
            this.borderRight = 200;
            this.firstPlatformY = -50;
            this.nextInterval = 0;
            this.init();
        }

        Pillars.prototype.randomPlatformY = function () {
            return this.minPlatformY + Math.random() * (this.maxPlatformY - this.minPlatformY);
        };

        Pillars.prototype.randomInterval = function () {
            return this.minInterval + Math.random() * (this.maxInterval - this.minInterval);
        };

        Pillars.prototype.init = function () {
            let x = this.xStart;
            let isFirst = true;
            while (x < this.borderRight) {
                let newPillar = new Pillar({
                    scene: this.scene,
                    x: x,
                    platformY: (isFirst ? this.firstPlatformY : this.randomPlatformY())
                });
                this.items.push(newPillar);
                this.lastPillar = newPillar;
                x += this.randomInterval();
                isFirst = false;
            }
            this.nextInterval = this.randomInterval();
        };

        Pillars.prototype.update = function () {
            this.isMoving = (gameObjects.player.sprite.platform ? 0 : this.pillarSpeed);
            for (let i = 0; i < this.items.length; i++) {
                let pillar = this.items[i];
                if (pillar.x() < this.borderLeft) {
                    pillar.destroy();
                    this.items.shift();
                }
                if (this.borderRight - this.lastPillar.x() >= this.nextInterval) {
                    let newPillar = new Pillar({
                        scene: this.scene,
                        x: this.borderRight,
                        platformY: this.randomPlatformY()
                    });
                    this.items.push(newPillar);
                    this.lastPillar = newPillar;
                    this.nextInterval = this.randomInterval();
                }
                pillar.vx = (this.isMoving ? this.pillarSpeed : 0);
                pillar.update();
            }
        };


        return {
            keyStatus: keyStatus,
            gameObjects: gameObjects,
            util: util,
            Jumper: Jumper,
            Pillars: Pillars
        }

    }

    


    if (typeof(window.jumper) === 'undefined'){
        window.Jumper = Jumper();
    }

})(window, wesa);