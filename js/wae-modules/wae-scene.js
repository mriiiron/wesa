// wae-scene.js

define(

    // Module Dependencies
    [],
    
    // Module Definition
    function () {
    
        function WAEScene() {
            this.spriteList = [];
        }

        WAEScene.prototype.addSprite = function (sprite) {
            var newIndex = null;
            for (var i = 0; i < this.spriteList.length; i++) {
                if (!this.spriteList[i]) {
                    newIndex = i;
                    this.spriteList[i] = sprite;
                }
            }
            if (!newIndex) {
                newIndex = this.spriteList.length;
                this.spriteList[newIndex] = sprite;
            }
            sprite.index = newIndex;
            sprite.scene = this;
        }
        
        WAEScene.prototype.update = function () {
            for (var i = 0; i < this.spriteList.length; i++) {
                if (this.spriteList[i]) {
                    this.spriteList[i].update();
                }
            }
        };
        
        WAEScene.prototype.addToRenderBatch = function () {
            for (var i = 0; i < this.spriteList.length; i++) {
                if (this.spriteList[i]) {
                    this.spriteList[i].addToRenderBatch();
                }
            }
        };

        return WAEScene;
    
    }

);