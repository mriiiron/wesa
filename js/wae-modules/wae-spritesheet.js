// wae-spritesheet.js

define(
    
    // Module Dependencies
    [],

    // Module Definition
    function () {
        
        function WAESpriteSheet(desc) {
            this.ssid = desc.ssid;
            this.texture = desc.texture;
            this.rowCount = desc.rowCount;
            this.colCount = desc.colCount;
            this.cellWidth = desc.cellWidth;
            this.cellHeight = desc.cellHeight;
        }
        
        WAESpriteSheet.prototype.getCellCount = function () {
            return this.rowCount * this.colCount;
        };
        
        WAESpriteSheet.prototype.getTextureClip = function (cellIndex, cellCount = 1, inverse = false) {
            
        };  

        return WAESpriteSheet;
        
    }

);