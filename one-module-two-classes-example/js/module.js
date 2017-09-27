// module.js

define(

    // Module Dependencies
    [],
    
    // Module Definition
    function () {
        
        var foo = function () {
            return 'foo';
        }
        
        var bar = 'bar';
        
        function Class1() {

        }
        
        Class1.prototype.hello = function () {
            console.log('hello');
        };
        
        function Class2() {
            
        }
        
        Class2.prototype.hello = function () {
            console.log('world');
        };

        return {
            foo: foo,
            Class1: Class1,
            Class2: Class2
        };
    
    }

);