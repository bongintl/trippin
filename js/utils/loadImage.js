module.exports = img => new Promise( resolve => {
    if ( img.dataset.srcset ) {
        img.addEventListener( 'load', () => resolve( img ) );
        img.srcset = img.dataset.srcset;
    } else if ( img.complete ) {
        resolve( img )
    } else {
        img.addEventListener( 'load', () => resolve( img ) );
    }
})
