(function (window, wesa) {
    'use strict'

    function Jumper () {

        const keyStatus = {
            jump: false
        };

        const util = {
            processPlatformCollisions: function (collisions) {
                for (let i = 0; i < collisions.length; i++) {
                    let c = collisions[i];
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
                position: { x: 0, y: 0 },
                scale: 2
            });
            this.sprite.flags.platformCollisionCheck = true;
            this.gravity = -0.25;
            this.jumpForce = 0;
            let me = this;
            let ai = new wesa.AI();
            ai.execute = function () {
                let s = this.self;
                s.acceleration.y = (s.platform ? 0 : me.gravity);
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
                    if (this.jumpForce < 8) {
                        this.jumpForce += 0.15;
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
            this.x = desc.x;
            this.vx = 0;
            this.supportSprite = [];
            let base = 32, bottom = -120;
            for (let i = 0; i < desc.height; i++) {
                let s = new wesa.Sprite({
                    object: wesa.assets.storedObjects[1],
                    action: 1,
                    position: { x: 0, y: bottom + i * base},
                    scale: 2
                });
                this.supportSprite.push(s);
                this.scene.addSpriteToLayer(0, s);
            }
            this.topSprite = new wesa.Sprite({
                object: wesa.assets.storedObjects[1],
                action: 0,
                position: { x: 0, y: bottom + desc.height * base},
                scale: 2
            });
            this.scene.addSpriteToLayer(0, this.topSprite);
            this.platform = new wesa.platform.Simple({
                position: { x: desc.x - base, y: bottom + (desc.height + 1) * base },
                length: base * 2
            });
            this.scene.addPlatform(this.platform);
        }
    
        Pillar.prototype.update = function () {
            for (let i = 0; i < this.supportSprite.length; i++) {
                this.supportSprite.velocity.x = this.vx;
            }
            this.topSprite.velocity.x = this.vx;
            this.platform.velocity.x = this.vx;
        }
    
        Pillar.prototype.destroy = function () {
    
        };


        return {
            keyStatus: keyStatus,
            util: util,
            Jumper: Jumper,
            Pillar: Pillar
        }

    }

    


    if (typeof(window.jumper) === 'undefined'){
        window.Jumper = Jumper();
    }

})(window, wesa);