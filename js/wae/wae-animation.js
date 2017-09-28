// wae-animation.js

define(

    // Module Dependencies
    [],
    
    // Module Definition
    function () {
        
        function WAEAnimation(desc) {
            this.name = desc.name;
            this.frameCount = desc.frameCount;
            this.isLoop = desc.isLoop;
            this.next = desc.next;
            this.ttl = desc.ttl;
            this.frameList = [];
            this.endTimeList = [];
        }
   
        WAEAnimation.prototype.addFrame = function (index, frame, endTime) {
            this.frameList[index] = frame;
            this.endTimeList[index] = endTime;
        };

        return WAEAnimation;
    
    }

);