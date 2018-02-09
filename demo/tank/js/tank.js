(function (window, wesa) {
    'use strict'

    function Tank() {

        function TMap(desc) {
            let canvas = document.createElement('canvas');
            let context = canvas.getContext('2d');
            let img = document.getElementById(desc.imgID);
            this.width = canvas.width = img.naturalWidth;
            this.height = canvas.height = img.naturalHeight;
            this.data = [];
            context.drawImage(img, 0, 0);
            let imgData = context.getImageData(0, 0, img.width, img.height);
            for (let i = 0; i < imgData.data.length; i += 4) {
                let r = imgData.data[i], g = imgData.data[i + 1], b = imgData.data[i + 2], a = imgData.data[i + 3];
                this.data.push(TMap.decode(r, g, b));
            }
        }

        TMap.decode = function (r, g, b) {
            if (r == 255 && g == 255 && b == 255) {
                return 1;
            }
            else if (r == 0 && g == 127 && b == 0) {
                return 2;
            }
            else if (r == 127 && g == 127 && b == 127) {
                return 3;
            }
            else if (r == 0 && g == 127 && b == 255) {
                return 4;
            }
            else if (r == 127 && g == 0 && b == 0) {
                return 5;
            }
            else {
                return 0;
            }
        }

        TMap.prototype.draw = function (scene) {
            
        }

        return {
            Map: TMap,
        };

    }

    if (typeof(window.tank) === 'undefined'){
        window.tank = Tank();
    }

})(window, wesa);
