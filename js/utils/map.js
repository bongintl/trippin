var vec2 = require('gl-vec2');
var vec2Utils = require('./vec2');

var WORLD_CENTER = vec2.fromValues( 128, 128 );

var fromLatLng = latLng => vec2.fromValues( latLng.lat(), latLng.lng() );
var fromPoint = point => vec2.fromValues( point.x, point.y );
var toPoint = ([ x, y ]) => ({ x, y });
var toLatLng = ([ lat, lng ]) => ({ lat, lng })

// var call = x => typeof x === 'function' ? x() : x;
// var callProp = prop => obj => call( obj[ prop ] );
// var lat = callProp('lat');
// var lng = callProp('lng');

var add = ( a, b ) => ({
    lat: a.lat() + b.lat(),
    lng: a.lng() + b.lng()
})

var zoomScale = zoom => Math.pow( 2, zoom );
var zoomScaleInv = size => Math.log( size ) / Math.log( 2 );

var worldToPx = ( point, zoom ) => (
    vec2.scale( vec2.create(), point, zoomScale( zoom ) )
)

var latLngToWorld = ( map, latLng ) => (
    fromPoint( map.getProjection().fromLatLngToPoint( latLng ) )
)

var latLngToPx = ( map, latLng, zoom = map.getZoom() ) => (
    worldToPx( latLngToWorld( map, latLng ), zoom )
)

var latLngToPxDistance = ( map, latLng, zoom = map.getZoom() ) => {
    console.warn('this dont work')
    var world = latLngToWorld( map, latLng );
    vec2.subtract( world, world, WORLD_CENTER );
    vec2Utils.abs( world, world )
    return worldToPx( world, zoom );
}

var latLngToScreen = ( map, latLng, zoom = map.getZoom() ) => {
    var bounds = map.getBounds();
    var topRight = latLngToPx( map, bounds.getNorthEast(), zoom );
    var bottomLeft = latLngToPx( map, bounds.getSouthWest(), zoom );
    var topLeft = vec2.fromValues( bottomLeft[ 0 ], topRight[ 1 ] );
    return vec2.subtract( topLeft, latLngToPx( map, latLng, zoom ), topLeft );
}

var pxToWorld = ( point, zoom ) => (
    vec2.scale( vec2.create(), point, 1 / zoomScale( zoom ) )
)

var worldToLatLng = ( map, point ) => (
    map.getProjection().fromPointToLatLng( toPoint( point ) )
)

var pxToLatLng = ( map, point, zoom = map.getZoom() ) => (
    worldToLatLng( map, pxToWorld( point, zoom ) )
);

var pxToLatLngDistance = ( map, distance, zoom = map.getZoom() ) => {
    var world = pxToWorld( distance, zoom );
    vec2.add( world, world, WORLD_CENTER );
    return worldToLatLng( map, world );
}

module.exports = {
    zoomScale,
    zoomScaleInv,
    fromLatLng,
    fromPoint,
    toLatLng,
    toPoint,
    add,
    worldToPx,
    latLngToWorld,
    latLngToPx,
    latLngToPxDistance,
    latLngToScreen,
    pxToWorld,
    worldToLatLng,
    pxToLatLng,
    pxToLatLngDistance
}