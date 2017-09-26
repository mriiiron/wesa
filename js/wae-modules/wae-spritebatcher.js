// wae-spritebatcher.js

define(

    // Module Dependencies
    [],
    
    // Module Definition
    function () {
    
		var batchList = [];
		
		var addToBatch = function (sprite) {
			var frame = sprite.getCurrentFrame();
            var x1 = sprite.position.x - frame.center.x;
            var x2 = x1 + frame.width;
            var y1 = sprite.position.y - frame.center.y;
            var y2 = y1 + frame.height;
			var ssid = frame.spriteSheet.ssid;
			if (batchList[ssid]) {
				// Append new vertices to batch
			}
			else {
				batchList[ssid] = {
                    positions = [x1, y1, x2, y1, x1, y2, x2, y2],
                    texCoords = [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0],
                    indices = [0, 1, 2, 1, 2, 3]
                }
			}
		};
        
        var clear = function () {
            // Clear sprite batch
        }
        
        var render = function () {
            
        }
	
    }

);