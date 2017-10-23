// wae-spritebatcher.js

define(

    // Module Dependencies
    [],
    
    // Module Definition
    function () {
    
        var batchList = [];
        
        var addSpriteToBatch = function (sprite) {
            var frame = sprite.getCurrentFrame();
            var x1 = sprite.position.x - frame.center.x;
            var x2 = x1 + frame.width;
            var y1 = sprite.position.y - frame.center.y;
            var y2 = y1 + frame.height;
            var ssid = frame.spriteSheet.ssid;
            if (batchList[ssid]) {
                batchList[ssid].spriteCount++;
                var indicesBase = 4 * (batchList[ssid].spriteCount - 1);
                batchList[ssid].positions.push(x1, y1, x2, y1, x1, y2, x2, y2);
                batchList[ssid].texCoords.push(0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0);
                batchList[ssid].indices.push(indicesBase, indicesBase + 1, indicesBase + 2, indicesBase + 1, indicesBase + 2, indicesBase + 3);
            }
            else {
                batchList[ssid] = {
                    spriteCount = 1,
                    positions = [x1, y1, x2, y1, x1, y2, x2, y2],
                    texCoords = [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0],
                    indices = [0, 1, 2, 1, 2, 3]
                }
            }
        };
        
        var clear = function () {
            batchList = [];
        }
        
        var render = function (gl, shaderProgramInfo) {
            
            for (var ssid = 0; ssid < batchList.length; ssid++) {
                if (batchList[ssid]) {
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, batchList[ssid].indices);
                    gl.activeTexture(gl.TEXTURE0);
                }
            }
            
            // Use indice index to draw
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
            
            // Tell WebGL we want to affect texture unit 0
            gl.activeTexture(gl.TEXTURE0);

            // Bind the texture to texture unit 0
            gl.bindTexture(gl.TEXTURE_2D, texture);

            // Tell the shader we bound the texture to texture unit 0
            gl.uniform1i(shaderProgramInfo.uniformLocations.uSampler, 0);
            
            // Draw a rectangle
            {
                const vertexCount = 6;
                const type = gl.UNSIGNED_SHORT;
                const offset = 0;
                gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
            }
            
            
        }
    
    }

);