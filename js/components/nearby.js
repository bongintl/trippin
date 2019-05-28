var Cookies = require('js-cookie');

var getLocation = () => new Promise( ( resolve, reject ) => {
    window.navigator.geolocation.getCurrentPosition( ({ coords: { latitude, longitude }}) => {
        Cookies.set( 'location', { latitude, longitude }, { expires: 1 / 24 / 2 } )
        resolve({ latitude, longitude });
    }, error => {
        var cached = Cookies.getJSON( 'location' );
        if ( cached ) {
            resolve( cached )
        } else {
            reject( error );
        }
    }, { timeout: 10000 })
})

module.exports = select => select( '.nearby', a => {
    a.addEventListener('click', () => {
        a.classList.add('nearby--busy');
        getLocation()
            .then( ({ latitude, longitude }) => {
                window.location.search = `near=${ latitude },${ longitude }`;
            })
            .catch( () => {
                a.classList.remove('nearby--busy')
                a.classList.add('nearby--error');
            })
    })
})