require('intersection-observer');
var createObserver = require('../utils/observer');

var observer;

module.exports = select => select( '.thumbnail--hero', el => {
    if ( !observer ) observer = createObserver( IntersectionObserver, { threshold: 0 } );
    var fixedText = el.querySelector('.thumbnail__text');
    var stickyText = el.querySelector('.thumbnail__sticky-text');
    var onIntersectionChange = entry => {
        var stuck = (
            !entry.isIntersecting &&
            entry.boundingClientRect.top > 0
        )
        stickyText.classList.toggle( 'thumbnail__sticky-text--stuck', stuck );
    }
    observer.observe( fixedText, onIntersectionChange );
    return () => observer.unobserve( fixedText, onIntersectionChange );
    
})