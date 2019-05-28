var vec2 = require('gl-vec2');
var box = require('./box');
var vec2Utils = require("./vec2")

var v2 = vec2.create;

var pairs = count => {
    var res = [];
    var i, j;
    for ( i = 0; i < count - 1; i++ ) {
        for ( j = i + 1; j < count; j++ ) {
            res.push( [ i, j ] );
        }
    }
    return res;
}

var resolve = ({ isOverlapping, separate, apply, maxIterations = 1 }, items ) => {
    var impulses = items.map( _ => v2() );
    var comparisons = pairs( items.length );
    for ( var i = 0; i < maxIterations; i++ ) {
        // var collisions = comparisons.filter( ([ i1, i2 ]) => (
        //     isOverlapping( items[ i1 ], items[ i2 ] )
        // ));
        // if ( !collisions.length ) break;
        comparisons.forEach( ([ i1, i2 ]) => {
            var [ impulse1, impulse2 ] = separate( items[ i1 ], items[ i2 ] )
            vec2.add( impulses[ i1 ], impulses[ i1 ], impulse1 );
            vec2.add( impulses[ i2 ], impulses[ i2 ], impulse2 );
        })
        var done = true;
        impulses.forEach( ( impulse, i ) => {
            if ( impulse[ 0 ] !== 0 || impulse[ 1 ] !== 0 ) done = false;
            apply( items[ i ], impulse );
            vec2.set( impulse, 0, 0 );
        })
        if ( done ) break;
    }
    return items;
}




var circleDistance = ( c1, r1, c2, r2 ) => vec2.distance( c1, c2 ) - ( r1 + r2 );
var circleOverlapsCircle = ( c1, r1, c2, r2 ) => circleDistance( c1, r1, c2, r2 ) <= 0;

var boxDistance = ( axis, box1, box2 ) => {
    var c1 = box.center( v2(), box1 )
    var c2 = box.center( v2(), box2 );
    // var d = vec2.subtract( v2(), c2, c1 );
    var size = vec2.add( v2(), box.size( v2(), box1 ), box.size( v2(), box2 ) )
    // vec2.scale( size, size, .5 );]
    var a = Math.atan2( axis[ 1 ], axis[ 0 ] );
    var sizeOnAxis = Math.min( Math.abs( Math.sin( a ) ) * size[ 0 ], Math.abs( Math.cos( a ) ) * size[ 1 ] );
    // vec2Utils.abs( d, d )
    // var size = vec2.add( v2(), box.size( v2(), box1 ), box.size( v2(), box2 ) )
    // vec2.scale( size, size, .5 );
    if ( vec2.distance( c1, c2 ) - sizeOnAxis < 0 ) debugger
    return vec2.distance( c1, c2 ) - sizeOnAxis;
//     var dist = vec2.subtract( v2(), d, size );
//     var dx = dist[ 0 ] / Math.abs( axis[ 0 ] );
//     var dy = dist[ 1 ] / Math.abs( axis[ 1 ] );
//     return Math.abs( dx ) < Math.abs( dy ) ? dx : dy;
}


var axis = ( out, p1, p2 ) => {
    vec2.subtract( out, p2, p1 )
    return vec2.normalize( out, out );
}

var splitForce = ( axis, dist ) => {
    var sep = vec2.scale( v2(), axis, dist * .5 );
    return [
        sep,
        vec2.negate( v2(), sep )
    ];
}

var seperateCircles = ( c1, r1, c2, r2 ) => {
    return splitForce( axis( v2(), c1, c2 ), circleDistance( c1, r1, c2, r2 ) );
}

var resolveCircles = ( radius, positions ) => resolve({
    isOverlapping: ( p1, p2 ) => circleOverlapsCircle( p1, radius, p2, radius ),
    separate: ( p1, p2 ) => seperateCircles( p1, radius, p2, radius ),
    apply: ( position, impulse ) => vec2.add( position, position, impulse )
}, positions )

var resolveMarkers = ( markers, padding = 5 ) => resolve({
    // isOverlapping: ( m1, m2 ) => {
    //     console.log( m1.labelBounds, m2.labelBounds )
    //     return (
    //         circleOverlapsCircle( m1.position, m1.radius, m2.position, m2.radius ) ||
    //         box.overlapping( m1.dotBounds, m2.labelBounds ) || 
    //         box.overlapping( m1.labelBounds, m2.dotBounds ) || 
    //         box.overlapping( m1.labelBounds, m2.labelBounds )
    //     )
    // },
    separate: ( m1, m2 ) => {
        var ax = axis( v2(), m1.position, m2.position );
        // debugger
        var dist = Math.min(
            0,
            // circleDistance( m1.position, m1.radius, m2.position, m2.radius ),
            // boxDistance( ax, m1.dotBounds, m2.labelBounds ),
            // boxDistance( ax, m1.labelBounds, m2.dotBounds ),
            boxDistance( ax, m1.labelBounds, m2.labelBounds )
        );
        return splitForce( ax, dist );
    },
    apply: ( { viewPosition, position }, impulse ) => vec2.set( viewPosition, position, impulse )
}, markers )

module.exports = { resolve, resolveCircles, resolveMarkers };