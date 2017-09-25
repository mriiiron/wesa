// wae-spritebatcher.js

define(

    // Module Dependencies
    [],
    
    // Module Definition
    function () {
    
		var batchList = [];
		
		var addToBatch = function (sprite) {
			var f = sprite.getCurrentFrame();
			var ssid = f.spriteSheet.ssid;
			if (batchList[ssid]) {
				// Append new vertices to batch
			}
			else {
				// Create new batch
			}
		};
        
        var clear() {
            // Clear sprite batch
        }
	
    }

);