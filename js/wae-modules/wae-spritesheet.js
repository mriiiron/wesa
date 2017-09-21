// wae-spritesheet.js

define(
    
    // Module Name
    'WAESpriteSheet',
    
    // Module Dependencies
    [],

    // Module Definition
    function () {

        var ssid;
        var texture;
        var rowCount, colCount;
        var cellWidth, cellHeight;
        
        function WAESpriteSheet(desc) {
            this.ssid = desc.ssid;
            this.texture = desc.texture;
            this.rowCount = desc.rowCount;
            this.colCount = desc.colCount;
            this.cellWidth = desc.cellWidth;
            this.cellHeight = desc.cellHeight;
        }
        
        var getCellCount = function () {
            return rowCount * colCount;
        };
        
        var getTextureClip = function (cellIndex, cellCount = 1, inverse = false) {
            
        };  

        return WAESpriteSheet;
        
    }

);