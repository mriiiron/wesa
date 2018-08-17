(function (window) {
    'use strict'

    if (typeof(window.wesa) === 'undefined'){
        console.warn('wesa core is not included.');
        return;
    }

    function WESAPlatform() {

        function WESASimplePlatform(desc) {
            this.x1 = desc.x1;
            this.x2 = desc.x2;
            this.y = desc.y;
        }

        return {
            Simple: WESASimplePlatform
        };

    }

    if (typeof(window.wesa.platform) === 'undefined'){
        window.wesa.platform = WESAPlatform();
    }

})(window);
