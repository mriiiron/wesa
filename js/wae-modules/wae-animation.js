// wae-animation.js

define(

    // Module Dependencies
    [],
    
    // Module Definition
    function () {
    
        function WAEFrame(desc) {
            this.spriteSheet = desc.spriteSheet;
            this.cellIndex = desc.cellIndex;
            this.cellCount = desc.cellCount;
            this.center.x = desc.center.x;
            this.center.y = desc.center.y;
            this.width = desc.spriteSheet.cellWidth * desc.cellCount;
            this.height = desc.spriteSheet.cellHeight;
        }
        
        function WAEAnimation(desc) {
            this.name = desc.name;
            this.frameCount = desc.frameCount;
            this.isLoop = desc.isLoop;
            this.next = desc.next;
            this.ttl = desc.ttl;
            this.frameList = [];
            this.endTimeList = [];
        }
        
        WAEAnimation.prototype.
    
    }

);