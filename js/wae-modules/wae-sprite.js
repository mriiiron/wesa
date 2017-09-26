// wae-sprite.js

define(

    // Module Dependencies
    ['WAESpriteBatcher'],
    
    // Module Definition
    function (WAESpriteBatcher) {
    
        function WAESprite(desc) {
            this.object = desc.object;
            this.action = desc.action;
            this.team = desc.team;
            this.position = { x: desc.position.x, y: desc.position.y };
            this.zDepth = desc.zDepth;
            this.index = null;
            this.scene = null;
			this.frameNum = 0;
			this.state = 0;
			this.time = 0;
        }
		
		WAESprite.prototype.getCurrentFrame = function () {
			return this.object.animList[this.action].frameList[this.frameNum];
		};
		
		WAESprite.prototype.changeAction = function (newAction) {
			
		};
       
        WAESprite.prototype.update = function () {
			var anim = this.object.animList[this.action];
            var animFrameCount = anim.frameList.length;
			this.time++;
			if (this.time >= anim.endTimeList[this.frameNum]) {
				this.frameNum++;
				if (this.time >= anim.endTimeList(animFrameCount - 1)) {
					this.time = 0;
				}
				if (this.frameNum >= animFrameCount) {
					this.frameNum = 0;
					if (!anim.isLoop) {
						this.changeAction(anim.next);
					}
				}
			}
        };
        
        WAESprite.prototype.addToRenderBatch = function () {
            WAESpriteBatcher.addSpriteToBatch(sprite);
        };

        return WAESprite;
    
    }

);