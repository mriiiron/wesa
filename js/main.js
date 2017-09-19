// main.js

require.config({
    baseUrl: './js/wae-modules',
    paths: {
        'testmodule': 'testmodule'
    }
});

require(['testmodule'], function (testmodule) {
    alert(testmodule.test());
})