require('intersection-observer');
var initMap = require('./map');
var styles = require('./mapStyles');
var vec2 = require('gl-vec2');
var box = require('../utils/box');
var viewportObserver = require('../utils/intersectionObserver');

var createObserver = require('../utils/observer');

var findBounds = selector => {
    var bounds = box.create();
    [ ...document.querySelectorAll( selector ) ].find( el => {
        box.setFromElement( bounds, el );
        return !box.isZero( bounds );
    })
    box.translate( bounds, bounds, [ 0, window.pageYOffset ] );
    return box.intersect( bounds, bounds, box.viewport );
}

module.exports = document => {
    if ( !document.querySelector('.guide') ) return;
    initMap().then( ({ map, markers, containMarkers, centerMarker, getMinZoom, setLabels }) => {
        
        var $ = s => document.querySelector( s );
        var $$ = s => [ ...document.querySelectorAll( s ) ];
        
        var state = {
            minZoom: 1,
            showMap: false,
            showMapLabels: false,
            showMarkers: true,
            mode: null,
            spot: 0
        }
        
        var update = () => {
            spotsContainer.classList.toggle( 'spots--show-map', state.showMap );
            spotBoundsEl.classList.toggle( 'map-bounds--spot', !state.showMap );
            spotBoundsEl.classList.toggle( 'map-bounds--spot-expanded', state.showMap );
            markersContainer.classList.toggle( 'map-markers--hidden', !state.showMarkers )
            state.minZoom = getMinZoom( coverBounds );
            var zoom = map.getZoom();
            zoomIn.classList.toggle( 'map__button--disabled', zoom >= 20 );
            zoomOut.classList.toggle( 'map__button--disabled', zoom <= state.minZoom );
            setLabels( state.showMapLabels );
            switch ( state.mode ) {
                case 'cover':
                    containMarkers( coverBounds );
                    break;
                case 'spot':
                    map.setZoom( 15 )
                    centerMarker( markers[ state.spot ], box.center( vec2.create(), spotBounds ) )
                    break;
                default: break;
            }
        }
        
        map.addListener( 'zoom_changed', () => {
            if ( map.getZoom() < state.minZoom ) map.setZoom( state.minZoom );
        })
        var zoomIn = $('.map__button--zoom-in');
        var zoomOut = $('.map__button--zoom-in');
        zoomIn.addEventListener( 'click', () => {
            map.setZoom( map.getZoom() + 1 )
        })
        zoomOut.addEventListener( 'click', () => map.setZoom( map.getZoom() - 1 ) )
        
        var coverBoundsElLandscape = $( '.map-bounds--cover-landscape' );
        var coverBoundsElPortrait = $( '.map-bounds-cover-portrait' );
        var coverBounds = box.create();
        var updateCoverBounds = () => {
            if ( window.innerWidth > window.innerHeight ) {
                box.setFromElement( coverBounds, coverBoundsElLandscape );
            } else {
                box.setFromElement( coverBounds, coverBoundsElPortrait );
                box.translate( coverBounds, coverBounds, vec2.fromValues( 0, window.pageYOffset ) );
            }
        }
        updateCoverBounds();
        window.addEventListener( 'resize', () => { updateCoverBounds(); update() } );
        
        var spotBoundsEl = $( '.map-bounds--spot' )
        var spotBounds = box.observeElement( spotBoundsEl, update );
        var spotsContainer = $('.spots');
        var spots = $$('.spot');
        var markersContainer = $('.map-markers');
        
        var { observe } = createObserver( IntersectionObserver, {
            rootMargin: '-49% 0% -49% 0%'
        });
        var onCenter = ( el, onEnter, onExit = () => {} ) => (
            observe( el, entry => entry.isIntersecting ? onEnter( entry ) : onExit( entry ) )
        )
        
        spots.forEach( ( spot, i ) => onCenter( spot, () => {
            state.mode = 'spot';
            state.spot = i;
            state.showMarkers = true;
            update();
        }));
        
        $$('.guide-cover-landscape, .guide-cover-portrait' ).forEach( cover => {
            onCenter( cover, () => {
                state.mode = 'cover';
                update();
            })
        })
        
        $('.spots__map-trigger').addEventListener( 'click', () => {
            state.showMap = !state.showMap;
            update();
        })
        
        $$( '[data-show-map-labels]' ).forEach( el => onCenter( el, () => {
            state.showMapLabels = true;
            update();
        }))
        
        $$( '[data-hide-map-labels]' ).forEach( el => onCenter( el, () => {
            state.showMapLabels = false;
            update();
        }))
        
        $$('[data-hide-markers]').forEach( el => onCenter(
            el,
            entry => {
                state.showMarkers = false;
                update();
            },
            entry => {
                state.showMarkers = true;
                update();
            },
        ))
        
        // $$( '[data-show-spots]' ).forEach( el => onCenter( el, () => {
        //     state.showMarkers = true;
        //     update();
        // }))
        
        // $$( '[data-hide-spots]' ).forEach( el => onCenter( el, () => {
        //     state.showMarkers = false;
        //     update();
        // }))
        
        // $$('[data-hide-markers]').forEach( el => viewportObserver.observe( el, entry => {
        //     state.showMarkers = !entry.isIntersecting;
        //     update();
        // }))
        
        update();
        window.addEventListener( 'resize', update )
        
    })
}
