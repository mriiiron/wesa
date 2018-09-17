(function (window) {
    'use strict'

    if (typeof(window.wesa) === 'undefined'){
        console.warn('wesa core is not included.');
        return;
    }

    function WESAPlatform() {

        function WESASimplePlatform(desc) {
            this.position = { x: desc.position.x, y: desc.position.y };
            this.length = desc.length;
            this.velocity = { x: 0, y: 0 };
            this.acceleration = { x: 0, y: 0 };
            this.deadFlag = false;
        }

        WESASimplePlatform.prototype.update = function () {
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
            this.velocity.x += this.acceleration.x;
            this.velocity.y += this.acceleration.y;
        }

        WESASimplePlatform.prototype.kill = function () {
            this.deadFlag = true;
        }

        return {
            Simple: WESASimplePlatform
        };

    }

    wesa.Scene.prototype.addPlatform = function(platform) {
        this.platformList.push(platform);
    };

    wesa.Scene.prototype.getPlatformCollisions = function (options) {
        let listOfSpriteList = [];
        if (options && options.layerIndexes && Array.isArray(options.layerIndexes)) {
            for (let i = 0; i < layerIndexes.length; i++) {
                if (this.layerList[layerIndexes[i]]) {
                    listOfSpriteList.push(this.layerList[layerIndexes[i]].spriteList);
                }
            }
        }
        else {
            for (let i = 0; i < this.layerList.length; i++) {
                if (this.layerList[i]) {
                    listOfSpriteList.push(this.layerList[i].spriteList);
                }
            }
        }
        let allSprites = [].concat.apply([], listOfSpriteList);
        let collisions = [], count = 0;
        for (let i = 0; i < allSprites.length; i++) {
            for (let j = 0; j < this.platformList.length; j++) {
                let s = allSprites[i], p = this.platformList[j];
                if (!s.flags.platformCollisionCheck) { continue; }
                if (s.position.y >= s.prevPosition.y) { continue; }
                if (s.prevPosition.x >= p.position.x && s.prevPosition.x <= p.position.x + p.length && s.prevPosition.y > p.position.y && s.position.y <= p.position.y ) {
                    collisions.push({
                        sprite: s,
                        platform: p,
                        collisionPoint: { x: s.prevPosition.x, y: p.position.y }
                    });
                }
            }
        }
        return collisions;
    };

    
    if (typeof(wesa.platform) === 'undefined'){
        wesa.platform = WESAPlatform();
    }

})(window);
