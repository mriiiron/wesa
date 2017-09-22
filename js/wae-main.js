// wae-main.js

// Configuration
require.config({
    baseUrl: './js/wae-modules',
    paths: {
        'WAESpriteSheet': 'wae-spritesheet'
    },
    
    // Use it in dev to bust cache
    urlArgs: 'bust=' +  (new Date()).getTime()
    
});

// Main
require(
    
    ['WAESpriteSheet'],
    
    function (WAESpriteSheet) {
    
        var desc = {
            ssid: 0,
            texture: null,
            rowCount: 4,
            colCount: 3,
            cellWidth: 50,
            cellHeight: 50
        }
    
        var wae_SpriteSheet = new WAESpriteSheet(desc);
        console.log(wae_SpriteSheet.getCellCount());
    
    
    
    }

);