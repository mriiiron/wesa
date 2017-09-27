// main.js


// RequireJS Configuration
requirejs.config({
    
    paths: {
        'Module': './module'
    },
    
    // Use it in dev to bust cache
    urlArgs: 'bust=' +  (new Date()).getTime()
    
});


// RequireJS Main
requirejs(
    
    // Load all modules
    ['Module'],
    
    // main()
    function (Module) {
        
        var c1 = new Module.Class1();
        c1.hello();
        var c2 = new Module.Class2();
        c2.hello();
        
    }

);