var vec2 = require('gl-vec2');
var vec2Utils = require('./vec2');
var createObserver = require('./observer');
var ResizeObserver = require( 'resize-observer-polyfill' );

var create = () => ({
    min: vec2.create(),
    max: vec2.create()
});

var setFromPoints = ( box, points ) => {
    vec2.set( box.min, Infinity, Infinity );
    vec2.set( box.max, -Infinity, -Infinity );
    return expand( box, box, ...points );
}

var fromPoints = points => setFromPoints( create(), points );

var setFromElement = ( out, el ) => {
    var { top, left, bottom, right } = el.getBoundingClientRect();
    vec2.set( out.min, left, top );
    vec2.set( out.max, right, bottom );
    return out;
}

var setFromElementOffset = ( out, el ) => {
    setFromElement( out, el );
    translate( out, out, [ 0, window.pageYOffset ] );
    return out;
}

var fromElement = el => setFromElement( create(), el );

var fromElementOffset = el => setFromElementOffset( create(), el );

var elementSize = ( out, el ) => {
    vec2.set( out.min, 0, 0 );
    vec2Utils.elementSize( out.max, el );
    return out;
}

var fromElementSize = el => elementSize( create(), el );

var expand = ( out, box, ...points ) => {
    points.forEach( point => {
        vec2.min( out.min, box.min, point )
        vec2.max( out.max, box.max, point )
    })
    return out;
}

var size = ( out, box ) => vec2.subtract( out, box.max, box.min );

var center = ( out, box ) => {
    var halfSize = vec2.scale( out, size( out, box ), .5 );
    return vec2.add( out, box.min, halfSize );
}

var translate = ( out, box, v ) => {
    vec2.add( out.min, box.min, v );
    vec2.add( out.max, box.max, v );
    return out;
}

var scale = ( out, box, scale ) => {
    vec2.scale( out.min, box.min, scale );
    vec2.scale( out.max, box.max, scale );
    return out;
}

var contain = ( out, destSize, srcSize, align ) => {
    var outSize = vec2Utils.contain( vec2.create(), destSize, srcSize );
    vec2Utils.align( out.min, destSize, outSize, align );
    vec2.add( out.max, out.min, outSize );
    return out;
}

var contains = ( box, v ) => (
    v[ 0 ] >= box.min[ 0 ] && v[ 0 ] <= box.max[ 0 ] &&
    v[ 1 ] >= box.min[ 1 ] && v[ 1 ] <= box.max[ 1 ]
)

var map = ( out, point, box1, box2 ) => vec2Utils.map( out, point, box1.min, box1.max, box2.min, box2.max );

var overlapping = ( box1, box2 ) => !(
    box2.min[ 0 ] > box1.max[ 0 ] ||
    box2.max[ 0 ] < box1.min[ 0 ] ||
    box2.min[ 1 ] > box1.max[ 1 ] ||
    box2.max[ 1 ] < box1.min[ 1 ]
);

var inset = ( out, box, v ) => {
    vec2.add( out.min, box.min, v );
    vec2.subtract( out.max, box.max, v );
    return out;
}

var isZero = box => (
    box.min[ 0 ] === 0 &&
    box.min[ 1 ] === 0 &&
    box.max[ 0 ] === 0 &&
    box.max[ 1 ] === 0
);

var intersect = ( out, box1, box2 ) => {
    out.min[ 0 ] = Math.max( box1.min[ 0 ], box2.min[ 0 ] );
    out.min[ 1 ] = Math.max( box1.min[ 1 ], box2.min[ 1 ] );
    out.max[ 0 ] = Math.min( box1.max[ 0 ], box2.max[ 0 ] );
    out.max[ 1 ] = Math.min( box1.max[ 1 ], box2.max[ 1 ] );
    return out;
}

var viewport = fromPoints([ vec2.fromValues( 0, 0 ), vec2.fromValues( window.innerWidth, window.innerHeight ) ])
window.addEventListener( 'resize', () => vec2.set( viewport.max, window.innerWidth, window.innerHeight ) );

var observer;
var observeElement = ( el, onChange ) => {
    var bounds = fromElement( el );
    if ( !observer ) observer = createObserver( ResizeObserver );
    observer.observe( el, () => {
        setFromElement( bounds, el );
        if ( onChange ) onChange( bounds );
    })
    return bounds;
}

module.exports = {
    create,
    expand,
    fromPoints,
    setFromPoints,
    fromElement,
    fromElementSize,
    fromElementOffset,
    setFromElementOffset,
    size,
    center,
    setFromElement,
    viewport,
    translate,
    scale,
    contain,
    contains,
    map,
    overlapping,
    inset,
    isZero,
    intersect,
    observeElement
}