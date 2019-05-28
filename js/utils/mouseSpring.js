var vec2 = require('gl-vec2');

var listeners = [];

var start = () => {
    var mouse = { client: null, page: null }
    var spring = { ...mouse };
    var running = false;
    window.addEventListener( 'mousemove', e => {
        var x, y;
        for ( var key in mouse ) {
            x = e[ `${ key }X` ];
            y = e[ `${ key }Y` ];
            if ( mouse[ key ] === null ) {
                mouse[ key ] = vec2.fromValues( x, y );
                spring[ key ] = vec2.fromValues( x, y );
            } else {
                vec2.set( mouse[ key ], x, y );
            }
        }
        if ( !running ) tick();
    });
    var tick = () => {
        running = true;
        for ( var key in mouse ) {
            vec2.lerp( spring[ key ], spring[ key ], mouse[ key ], .1 );
        }
        listeners.forEach( fn => fn( spring ) );
    }
}

module.exports = onChange => {
    listeners.push( onChange );
    if ( listeners.length === 1 ) start();
}