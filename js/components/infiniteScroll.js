var intersectionObserver = require('../utils/intersectionObserver');

var parser = new DOMParser();

module.exports = select => select('[data-load-more]', ( container, bind ) => {
    var nextPage = container.dataset.loadMore;
    if ( !nextPage ) return;
    var footer = document.querySelector('.footer');
    footer.style.display = 'none';
    var load = () => fetch( nextPage )
        .then( r => r.text() )
        .then( text => {
            var nextDocument = parser.parseFromString( text, "text/html" );
            var nextContainer = nextDocument.querySelector( '[data-load-more]' );
            var items = [ ...nextContainer.children ];
            if ( !items.length ) return;
            items.forEach( el => {
                container.appendChild( el )
                bind( el );
            });
            nextPage = nextContainer.dataset.loadMore;
            if ( nextPage ) {
                watch();
            } else {
                footer.style.display = '';
            }
        })
    var cleanup;
    var watch = () => {
        intersectionObserver.once( container.lastElementChild, load );
        cleanup = () => intersectionObserver.unobserve( container.lastElementChild, load );
    }
    watch();
    return () => cleanup && cleanup();
})