(function (window) {
    'use strict'

    if (typeof(window.wesa) === 'undefined'){
        console.warn('wesa core is not included.');
        return;
    }

    function WESAPlatform() {

        function WESASimplePlatform(desc) {
            this.x1 = desc.x1;
            this.x2 = desc.x2;
            this.y = desc.y;
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
                if (s.prevPosition.x >= p.x1 && s.prevPosition.x <= p.x2 && s.prevPosition.y > p.y && s.position.y <= p.y ) {
                    collisions.push({
                        sprite: s,
                        platform: p,
                        collisionPoint: { x: s.prevPosition.x, y: p.y }
                    });
                }
            }
        }
        return collisions;
    };

    wesa.Scene.prototype.processPlatformCollisions = function (options) {
        let collisions = this.getPlatformCollisions(options);
        for (let i = 0; i < collisions.length; i++) {
            let c = collisions[i];
            c.sprite.platform = c.platform;
            c.sprite.position.x = c.collisionPoint.x;
            c.sprite.position.y = c.collisionPoint.y;
            c.sprite.velocity.x = 0;
            c.sprite.velocity.y = 0;
        }
    };

    if (typeof(wesa.platform) === 'undefined'){
        wesa.platform = WESAPlatform();
    }

})(window);
