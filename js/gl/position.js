var vec2 = require('gl-vec2');
var GyroNorm = require('gyronorm/dist/gyronorm.complete');

var gyro = new GyroNorm();
var position = vec2.create();

// var tracker = document.createElement('div');
// Object.assign( tracker.style, {
//     position: 'fixed',
//     width: '10px',
//     height: '10px',
//     background: 'red',
//     zIndex: 100000000
    
// })
// document.body.appendChild( tracker );

gyro.init()
    .then(() => {
        var center = vec2.fromValues( window.innerWidth / 2, window.innerHeight / 2 );
        var tilt = vec2.create();
        var acceleration = vec2.create();
        gyro.start( data => {
            vec2.set( acceleration, data.dm.beta * -.1, data.dm.alpha * -.1 );
            // console.log( acceleration )
            // vec2.add( tilt, data.dm.x, data.do.beta / 90 );
        })
        window.addEventListener( 'resize', () => {
            vec2.set( center, window.innerWidth / 2, window.innerHeight / 2 );
        })
        var update = () => {
            vec2.add( tilt, tilt, acceleration );
            vec2.add( position, center, tilt );
            vec2.scale( tilt, tilt, .994 );
            requestAnimationFrame( update );
            // tracker.style.left = position[ 0 ] + 'px'
            // tracker.style.top = position[ 1 ] + 'px'
        }
        update();
    })
    .catch(() => {
        var mouse = vec2.create();
        var scroll = vec2.create();
        var target = vec2.create();
        window.addEventListener( 'mousemove', e => {
            vec2.set( mouse, e.clientX, e.clientY );
        })
        window.addEventListener( 'scroll', e => {
            vec2.set( scroll, window.pageXOffset, window.pageYOffset );
        })
        var update = () => {
            vec2.add( target, mouse, scroll );
            vec2.lerp( position, position, target, .05 );
            requestAnimationFrame( update );
        }
        update();
    })

module.exports = position;