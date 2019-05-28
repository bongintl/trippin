var intersectionObserver = require('../utils/intersectionObserver');
var loadImage = require('../utils/loadImage');

module.exports = select => select('.lazy', el => {
    
    var imgs = el.nodeName === 'IMG'
        ? [ el ]
        : [ ...el.querySelectorAll('img') ];
        
    var load = img => loadImage( img ).then( img => img.classList.add('lazy-loaded') );
    var loadAll = () => Promise.all( imgs.map( load ) );
    
    var onDone = () => {
        el.dispatchEvent( new window.Event( 'lazy-loaded' ) );
        if ( el.dataset.loadedClass ) el.classList.add( el.dataset.loadedClass );
    }
    
    var onEnter = () => loadAll().then( onDone );
    
    intersectionObserver.once( el, onEnter )
    
    return () => intersectionObserver.unobserve( el, onEnter );
    
})