// wae-animation-frame.js

define(

    // Module Dependencies
    [],
    
    // Module Definition
    function () {
    
        function WAEFrame(desc) {
            this.spriteSheet = desc.spriteSheet;
            this.cellIndex = desc.cellIndex;
            this.cellCount = desc.cellCount;
            this.center = { x: desc.center.x, y: desc.center.y };
            this.width = desc.spriteSheet.cellWidth * desc.cellCount;
            this.height = desc.spriteSheet.cellHeight;
        }
        
        return WAEFrame;
    
    }

);