var resizeObserver = require('../utils/resizeObserver');

module.exports = select => select('.sticky-center', el => {
    resizeObserver.observe( el, entry => {
        el.style.top = ( ( window.innerHeight - entry.contentRect.height ) / 2 ) + 'px'
    })
    return () => resizeObserver.unobserve( el )
})