var vec2 = require('gl-vec2');
var { elementSize,  } = require('../utils/vec2');
var box = require('../utils/box');
var intersectionObserver = require('../utils/intersectionObserver')

var fit = ( positions, radius, containerSize, maxIterations = 3 ) => {
    var fromBounds = box.create(),
        fromSize = vec2.create(),
        toBounds = box.create(),
        toSize = vec2.create();
    for ( var i = 0; i < maxIterations; i++ ) {
        box.setFromPoints( fromBounds, positions );
        box.size( fromSize, fromBounds );
        box.contain( toBounds, containerSize, fromSize );
        positions.forEach( p => box.map( p, p, fromBounds, toBounds ) )
        // positions = overlaps.resolveCircles( radius, positions );
        if ( positions.every( p => box.contains( toBounds, p ) ) ) break;
    }
    return positions;
}

module.exports = select => select( '.dots', container => {
    
    var dots = [ ...container.querySelectorAll('.dots__dot') ];
    if ( !dots.length ) return;
    var locations = dots.map( el => vec2.fromValues(
        Number( el.dataset.lng ),
        Number( el.dataset.lat )
    ))
    
    var dotSize = vec2.create();
    var containerSize = vec2.create();
    
    var layout = () => {
        elementSize( dotSize, dots[ 0 ] );
        elementSize( containerSize, container );
        var positions = fit( locations, dotSize[ 0 ] / 2 + 2, containerSize );
        dots.forEach( ( el, i ) => {
            var position = positions[ i ];
            el.style.left = position[ 0 ] + 'px';
            el.style.top = containerSize[ 1 ] - position[ 1 ] + 'px';
        })
    }
    
    layout();
    intersectionObserver.once( container, () => {
        dots.forEach( ( dot, i ) => {
            dot.style.opacity = 1;
        })
        window.addEventListener( 'resize', layout );
    })
    
    return () => window.removeEventListener( 'resize', layout );
    
})