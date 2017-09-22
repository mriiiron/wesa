// wae-scene.js

define(

    // Module Dependencies
    [],
    
    // Module Definition
    function () {
    
        function WAEScene() {
            this.spriteList = [];
        }
       
        WAEScene.prototype.update = function () {
            for (int i = 0; i < this.spriteList.length; i++) {
                if (spriteList[i]) {
                    spriteList[i].update();
                }
            }
        };
        
        WAEScene.prototype.render = function () {
            for (int i = 0; i < this.spriteList.length; i++) {
                if (spriteList[i]) {
                    spriteList[i].render();
                }
            }
        };

        return WAEScene;
    
    }

);