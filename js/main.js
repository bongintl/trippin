var components = require('./components');

components( document.documentElement );

require('./guide/guide')( document )

document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
});

document.documentElement.classList.add( 'ontouchstart' in window ? 'touch' : 'no-touch' );