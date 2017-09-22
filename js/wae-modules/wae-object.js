// wae-object.js

define(

    // Module Dependencies
    [],
    
    // Module Definition
    function () {
        
        function WAEObject(desc) {
            this.oid = desc.oid;
            this.type = desc.type;
            this.name = desc.name;
            this.animList = [];
        }
        
        WAEObject.prototype.addAnimationAt = function(slot, anim) {
            animList[slot] = anim;
        };

        return WAEObject;
    
    }

);