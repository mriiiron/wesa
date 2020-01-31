WESA - WebGL-based Engine of Sprite Animation
-----------------------------------------------

Perhaps the simplest and lightest (14KB, currently) solution for turning your brilliant idea into old-school style, pixel-friendly sprite animations being displayed on the web.

You may consider to use fancy libs such as [PixiJS](http://www.pixijs.com) or even [ThreeJS](https://threejs.org), but WESA would be your simple but elegant start to learn to animate your favorite sprites in browser.

WesaJS will always be fully open-sourced, for the sake of my personal passion on sprite animations and retro-style games.

### Basic Example

#### Include WESA

```html
<script src="./js/wesa.min.js"></script>
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

[See full demo](http://caiyi.tech/wesa)

### More Demos

* Coming soon!

### Gallery

* [OpenCity](http://caiyi.tech/open-city)

### History

WesaJS is a successor of my following college works:

- [aero-engine-3d](https://github.com/mriiiron/aero-engine-d3d): C++ & DirectX;
- [aero-engine-opengl](https://github.com/mriiiron/aero-engine-opengl): C++ & OpenGL.

### To-do

- [x] Pausing

### License

MIT
