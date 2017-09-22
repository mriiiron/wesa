// wae-sprite.js

define(

    // Module Dependencies
    [],
    
    // Module Definition
    function () {
    
        function WAESprite(desc) {
            this.object = desc.object;
            this.action = desc.action;
            this.team = desc.team;
            this.position = { x: desc.position.x, y: desc.position.y };
            this.zDepth = desc.zDepth;
        }
       
        WAESprite.prototype.update = function () {
            
        };
        
        WAESprite.prototype.render = function () {
            
        };

        return WAESprite;
    
    }

);