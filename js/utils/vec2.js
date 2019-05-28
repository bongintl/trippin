var vec2 = require('gl-vec2');
var { map: _map } = require('./math');

var elementPosition = ( out, el ) => {
    var { x, y } = el.getBoundingClientRect();
    return vec2.set( out, x, y );
}

var elementSize = ( out, el ) => {
    var { width, height } = el.getBoundingClientRect();
    return vec2.set( out, width, height );
}

var fromElementSize = el => elementSize( vec2.create(), el );

var map = ( out, x, oldMin, oldMax, newMin, newMax ) => (
    vec2.set( out,
        _map( x[ 0 ], oldMin[ 0 ], oldMax[ 0 ], newMin[ 0 ], newMax[ 0 ] ),
        _map( x[ 1 ], oldMin[ 1 ], oldMax[ 1 ], newMin[ 1 ], newMax[ 1 ] )
    )
)

var containScale = ( dest, src ) => Math.min( dest[ 0 ] / src[ 0 ], dest[ 1 ] / src[ 1 ] );
var contain = ( out, dest, src ) => vec2.scale( out, src, containScale( dest, src ) );

var center = vec2.fromValues( .5, .5 );
var align = ( out, dest, src, align = center ) => {
    var margins = vec2.subtract( out, dest, src );
    return vec2.multiply( out, margins, align );
}

var abs = ( out, v ) => vec2.set( out, Math.abs( v[ 0 ] ), Math.abs( v[ 1 ] ) );

var viewport = vec2.fromValues( window.innerWidth, window.innerHeight );
window.addEventListener('resize', () => vec2.set( viewport, window.innerWidth, window.innerHeight ));

module.exports = {
    elementPosition,
    elementSize,
    align,
    contain,
    containScale,
    map,
    abs,
    viewport
}