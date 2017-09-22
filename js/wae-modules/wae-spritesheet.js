// wae-spritesheet.js

define(
    
    // Module Dependencies
    [],

    // Module Definition
    function () {
        
        function WAESpriteSheet(desc) {
            this.ssid = desc.ssid;
            this.rowCount = desc.rowCount;
            this.colCount = desc.colCount;
            this.cellWidth = desc.cellWidth;
            this.cellHeight = desc.cellHeight;
            this.texture = null;
        }
        
        WAESpriteSheet.prototype.loadTextureFromFile = function (gl, url) {
            this.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            
            // Opaque white pixel used as texture before the actual image loads
            const level = 0;
            const internalFormat = gl.RGBA;
            const width = 1;
            const height = 1;
            const border = 0;
            const srcFormat = gl.RGBA;
            const srcType = gl.UNSIGNED_BYTE;
            const pixel = new Uint8Array([255, 255, 255, 255]);
            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);
            
            // Load actual texture
            const image = new Image();
            image.onload = function() {
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);  // Use NEAREST for both texture magnification and minification to keep texture sharp
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);  // Do not generate Mipmap or using LINEAR since we need sharp textures
            };
            image.src = url;
        };
        
        WAESpriteSheet.prototype.getCellCount = function () {
            return this.rowCount * this.colCount;
        };
        
        WAESpriteSheet.prototype.getTextureClip = function (cellIndex, cellCount = 1, inverse = false) {
            var rect = {};
            var clipCellW = 1.0 / this.colCount;
            var clipCellH = 1.0 / this.rowCount;
            rect.x1 = clipCellW * (cellIndex % colCount);
            rect.x2 = rect.x1 + clipCellW * cellCount;
            rect.y1 = clipCellH * Math.floor(cellIndex / colCount);
            rect.y2 = rect.y1 + clipCellH;
            return rect;
        };  

        return WAESpriteSheet;
        
    }

);