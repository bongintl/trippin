require('intersection-observer');
var createObserver = require('./observer');

var { observe, unobserve } = createObserver( IntersectionObserver, { rootMargin: '50px' });

var once = ( el, cb ) => {
    var handler = entry => {
        if ( entry.isIntersecting ) {
            cb( entry );
            unobserve( el, handler );
        }
    }
    observe( el, handler );
}

module.exports = { observe, unobserve, once };