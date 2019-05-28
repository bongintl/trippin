var Masonry = require('masonry-layout');

module.exports = select => select('.masonry', el => {
    var masonry = null;
    var create = () => {
        if ( masonry !== null ) return;
        masonry = new Masonry( el, {
            columnWidth: '.masonry__sizer',
            itemSelector: '.masonry__item',
            transitionDuration: 0
        })
    }
    var destroy = () => {
        if ( masonry === null ) return;
        masonry.destroy();
        masonry = null;
    }
    var update = () => window.innerWidth < 768 ? destroy() : create();
    window.addEventListener( 'resize', update );
    update();
    el.style.visibility = 'visible';
    return destroy;
})