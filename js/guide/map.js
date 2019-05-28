/* global google */

var vec2 = require('gl-vec2');
var box = require('../utils/box');
var mapUtils = require('../utils/map');
var loadScript = require('../utils/loadScript');
var styles = require('./mapStyles');
var Marker = require('./Marker');
var { World } = require('p2');

var loadMap = ( el, options ) => new Promise( resolve => {
    var map = new google.maps.Map( el, options );
    map.addListener( 'projection_changed', () => resolve({ el, map }) );
})

var loadOverlayHelper = ({ el, map }) => new Promise( resolve => {
    var overlayHelper = new google.maps.OverlayView();
    overlayHelper.onAdd = () => resolve({ el, map, overlayHelper });
    overlayHelper.draw = () => {};
    overlayHelper.setMap( map );
})

var labelMargin = ( map, markers, zoom ) => {
    var positions = markers.map( m => mapUtils.latLngToPx( map, m.latLng, zoom ) )
    var maxDot = markers.reduce( ( max, marker, i ) => {
        return Math.max( max, positions[ i ][ 0 ] + marker.radius );
    }, -Infinity );
    var maxLabel = markers.reduce( ( max, marker, i ) => {
        if ( !marker.labelVisible ) return maxDot;
        return Math.max( max, positions[ i ][ 0 ] + marker.labelBounds.max[ 0 ] );
    }, -Infinity );
    return ( maxLabel - maxDot );
}

var zoomToContain = ( map, markers, worldSize, containerSize ) => {
    var zoom, markersPxSize, margin;
    for ( zoom = 20; zoom >= 1; zoom-- ) {
        markersPxSize = mapUtils.worldToPx( worldSize, zoom )
        margin = labelMargin( map, markers, zoom );
        markersPxSize[ 0 ] += margin;
        if (
            markersPxSize[ 0 ] <= containerSize[ 0 ] &&
            markersPxSize[ 1 ] <= containerSize[ 1 ]
        ) break;
    }
    return { zoom, margin };
}

var placeLatLngAtPx = ( map, latLng, px, zoom = map.getZoom() ) => {
    var offsetPx = vec2.subtract(
        vec2.create(),
        box.center( vec2.create(), box.viewport ),
        px
    );
    var offsetLatLng = mapUtils.pxToLatLngDistance( map, offsetPx, zoom );
    return mapUtils.add( latLng, offsetLatLng );
}

var initMarkers = ({ el, map, overlayHelper }) => {
    
    var { LatLng, LatLngBounds } = google.maps;
    
    var worldToPhysicsScale = mapUtils.zoomScale( 20 );
    
    var markers = [ ...document.querySelectorAll('.marker') ].map( el => {
        var latLng = new LatLng( Number( el.dataset.lat ), Number( el.dataset.lng ) );
        var p = mapUtils.latLngToWorld( map, latLng );
        vec2.scale( p, p, worldToPhysicsScale );
        return new Marker( el, latLng, p );
    });
    
    var markerLatLngBounds = markers.reduce( ( bounds, { latLng } ) => (
        bounds.extend( latLng )
    ), new LatLngBounds() );
    var markerLatLngSize = markerLatLngBounds.toSpan();
    var markerLatLngCenter = markerLatLngBounds.getCenter();
    
    var markerWorldBounds = box.fromPoints( markers.map( ({ latLng }) => (
        mapUtils.latLngToWorld( map, latLng )
    )));
    var markerWorldSize = box.size( vec2.create(), markerWorldBounds );

    var project = latLng => mapUtils.fromPoint( overlayHelper.getProjection().fromLatLngToContainerPixel( latLng ) );
    var markerToLatLng = p => {
        return mapUtils.worldToLatLng( map, vec2.scale( vec2.create(), p, 1 / worldToPhysicsScale ) )
    }
    var projectMarker = p => project( markerToLatLng( p ) );
    
    var world = new World({ gravity: [ 0, 0 ]});
    markers.forEach( ({ body, spring }) => {
        world.addBody( body );
        world.addSpring( spring );
    });
    
    var d = vec2.create();
    var maxDistSq = Math.pow( .1, 2 );
    var markerIsStill = marker => {
        var p = projectMarker( marker.body.position );
        var pp = projectMarker( marker.body.previousPosition );
        vec2.subtract( d, p, pp )
        return vec2.squaredLength( d ) < maxDistSq;
    }
    
    var render = () => {
        markers.forEach( ( m, i ) => {
            switch ( m.mode ) {
                case 'physical':
                    m.render( projectMarker( m.body.interpolatedPosition ) );
                    break;
                case 'exact':
                    m.render( project( m.latLng ) );
                    break;
            }
        });
    }
    
    var running, then;
    var run = () => {
        if ( running ) return;
        running = true;
        tick();
    }
    var stillFrames = 0;
    var tick = now => {
        var deltaTime = then ? ( now - then ) / 1000 : 0;
        world.step( 1/60, deltaTime, 10 );
        render();
        if ( markers.every( markerIsStill ) ) {
            stillFrames++;
        } else {
            stillFrames = 0;
        }
        if ( stillFrames >= 5 ) {
            then = null;
            running = false;
        } else {
            then = now;
            requestAnimationFrame( tick );
        }
    }
    
    var worldWidth = 0;
    var update = () => {
        var ww = overlayHelper.getProjection().getWorldWidth();
        if ( ww !== worldWidth ) {
            var scale = 1 / ( ww / 256 );
            markers.forEach( m => m.setScale( scale * worldToPhysicsScale ) );
            worldWidth = ww;
            run();
        }
        if ( !running ) {
            render();
        }
    }
    
    overlayHelper.draw = update;
    
    run();
    
    var labelsVisible = false;
    var setLabels = to => {
        if ( labelsVisible !== to ) {
            labelsVisible = to;
            map.setOptions({ styles: to ? styles.default : styles.noLabels })
        }
    }
    
    markers.forEach( m => {
        setTimeout( () => m.el.style.opacity = 1, Math.random() * 15000 )
    })
    
    return {
        el,
        map,
        markers,
        getMinZoom: bounds => {
            // console.log( zoomToContain( map, markers, markerWorldSize, box.size( vec2.create(), bounds ) ).zoom )
            return 1;
            return zoomToContain( map, markers, markerWorldSize, box.size( vec2.create(), bounds ) ).zoom
        },
        containMarkers: bounds => {
            var { zoom, margin } = zoomToContain( map, markers, markerWorldSize, box.size( vec2.create(), bounds ) );
            var center = box.center( vec2.create(), bounds );
            center[ 0 ] -= margin / 2;
            map.setZoom( zoom );
            var latLngCenter = placeLatLngAtPx( map, markerLatLngCenter, center, zoom );
            map.setCenter( latLngCenter );
            markers.forEach( m => {
                m.el.style.opacity = 1
                m.mode = 'physical'
            });
            
        },
        centerMarker: ( marker, point, animate = true ) => {
            var latLng = marker.latLng;
            var center = placeLatLngAtPx( map, latLng, point );
            // if ( animate ) {
                map.panTo( center )
            // } else {
            //     map.setCenter( center );
            // }
            // map.setCenter( center );
            markers.forEach( m => {
                if ( m === marker ) {
                    m.el.style.opacity = 1;
                    m.mode = 'exact';
                } else {
                    m.el.style.opacity = 0;
                    m.mode = 'hidden';
                }
            });
        },
        setLabels
    }
}

module.exports = () => {
    var el = document.querySelector('.map');
    if ( !el ) return Promise.reject();
    return loadScript( `https://maps.googleapis.com/maps/api/js?key=${ el.dataset.apiKey }` )
        .then( () => loadMap( el.querySelector( '.map__map' ), {
            zoom: 1,
            center: new google.maps.LatLng( 0, 0 ),
            mapTypeControl: false,
            zoomControl: false,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: false,
            scrollwheel: false,
            styles: styles.noLabels,
            gestureHandling: 'greedy'
        }))
        .then( loadOverlayHelper )
        .then( initMarkers )
}