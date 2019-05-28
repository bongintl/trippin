var WeakMap = require('es6-weak-map');

var components = [
    require('./dots'),
    require('./thumbnail'),
    require('./img'),
    require('./lazy'),
    require('./masonry'),
    require('./shader'),
    require('./signup'),
    require('./nav-compact'),
    require('./spot'),
    require('./dragging'),
    require('./infiniteScroll'),
    require('./search'),
    require('./nearby'),
    require('./sticky-center')
];

var cleanupFns = new WeakMap();
var registerCleanupFn = ( el, fn ) => {
    if ( cleanupFns.has( el ) ) {
        cleanupFns.set( el, [ ...cleanupFns.get( el ), fn ] );
    } else {
        cleanupFns.set( el, [ fn ] );
    }
}
var cleanup = el => {
    if ( cleanupFns.has( el ) ) {
        cleanupFns.get( el ).forEach( fn => fn() );
        cleanupFns.delete( el );
    }
}
var unbind = el => [ el, ...el.querySelectorAll( '*' ) ].forEach( cleanup );

var bind = root => {
    var select = ( selector, action ) => {
        var elements = [ ...root.querySelectorAll( selector ) ];
        if ( root.matches( selector ) ) elements.unshift( root );
        elements.forEach( el => {
            var res = action( el, bind, unbind )
            if ( typeof res === 'function' ) registerCleanupFn( el, res );
        })
    }
    components.forEach( component => component( select ) );
}

module.exports = bind;