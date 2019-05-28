var debounce = require('lodash/debounce');
var parser = new DOMParser();

// var diff = ( oldEl, ne )

module.exports = select => select( 'body', ( body, bind, unbind ) => {
    var el = body.querySelector( '.search' );
    var isOpen = false;
    [ ...body.querySelectorAll( '.toggle-search' ) ].forEach( tog => {
        tog.addEventListener( 'click', e => {
            e.preventDefault();
            if ( isOpen ) {
                el.classList.remove( 'search--open' )
                input.blur();
                body.classList.remove( 'noscroll' );
                isOpen = false;
            } else {
                el.classList.add( 'search--open' )
                body.classList.add( 'noscroll' );
                input.focus();
                isOpen = true;
            }
            
        });
    })
    var input = el.querySelector( 'input' );
    var results = el.querySelector( '.search__results' );
    var query = "";
    var fetching = false;
    var search = () => {
        console.log( 'searching ', query )
        var originalQuery = query;
        if ( fetching ) return;
        fetching = true;
        return fetch( `/search/${ query }` )
            .then( r => r.text() )
            .then( text => parser.parseFromString( text, 'text/html' ) )
            .then( doc => {
                fetching = false;
                if ( query !== originalQuery ) return search();
                var nextResults = doc.querySelector( '.search__results' );
                unbind( results );
                results.parentElement.replaceChild( nextResults, results );
                bind( nextResults );
                results = nextResults;
            })
    }
    var onInput = debounce( search, 200 );
    input.addEventListener( 'input', () => {
        query = input.value;
        onInput();
    })
})