var debounce = require('lodash/debounce')
var { observe, unobserve } = require('../utils/resizeObserver')

module.exports = select => select( 'img[srcset], img[data-srcset]', img => {
    var update = width => img.setAttribute( 'sizes', width + 'px' );
    update( img.getBoundingClientRect().width );
    var onSizeChange = debounce( entry => update( entry.contentRect.width ), 100 );
    observe( img, onSizeChange );
    return () => unobserve( img, onSizeChange );
})