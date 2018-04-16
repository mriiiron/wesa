WESA - WebGL-based Engine of Sprite Animation
-----------------------------------------------

### Simple and Light-weighted

Perhaps the simplest and easiest solution to turn your idea into old-school style, pixel-friendly sprite animations being displayed on the web.

You may consider to use fancy libs such as [PixiJS](http://www.pixijs.com) or even [ThreeJS](https://threejs.org), but WESA would be your simple but elegant start to learn to animate your favorite sprites in browser.

### Free and Open-sourced

WESA will always be fully open-sourced, for the sake of my personal passion on sprite animations and retro-style games.

### Basic Example

#### Include WESA

```html
<script src="./js/wesa.js"></script>
```

#### Prepare a Canvas

```html
<canvas id="canvas" width="640" height="480"></canvas>
```

#### Write Scripts

```javascript
// Initializing WESA
wesa.core.init(document.getElementById('canvas'));

// Adding sprite sheets
wesa.assets.source.spriteSheetUrlArray.push('./assets/texture/megaman.png');

// Adding object definition file
wesa.assets.source.objectJsonUrl = './assets/megaman.json';

wesa.assets.load(function () {

    // Create the scene
    let scene = new wesa.Scene('Scene');

    // Add a sprite
    scene.addSpriteToLayer(0, new wesa.Sprite({
        object: wesa.assets.objectList[0],
        action: 0,
        team: 0,
        position: { x: 0, y: 0 },
        scale: 4
    }));

    // Run the scene
    let animate = function () {
        requestAnimationFrame(animate);
        scene.update();
        scene.render();
    }
    animate();

});
```

[See full demo](http://caiyi.us/wesa)

### More Demos

* [Canvas Resizable](http://caiyi.us/wesa/demo/#1.resize.html)
* [Collisions](http://caiyi.us/wesa/demo/#2.collision.html)
* [Camera Control](http://caiyi.us/wesa/demo/#3.camera.html)
* [OpenCity (Open-sourced Battle City)](http://caiyi.us/wesa/demo/#opencity/index.html)

### License

MIT
