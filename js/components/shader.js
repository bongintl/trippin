var vec2 = require('gl-vec2');
var tinycolor = require('tinycolor2');
var box = require('../utils/box');
var createTexture = require('gl-texture2d');
var renderer = require('../gl/renderer');
var debounce = require('lodash/debounce');
var intersectionObserver = require('../utils/intersectionObserver')
var resizeObserver = require('../utils/resizeObserver')
var tween = require('../utils/tween');

var glslify = require('glslify');
var frag = glslify.file('./../gl/frag.glsl');

var DURATION = 8000;

var onImageLoad = img => new Promise( resolve => {
    if ( img.srcset && img.complete ) {
        resolve( img )
    } else {
        img.addEventListener( 'load', () => resolve( img ) );
    }
})

var colorToVector = color => {
    var { r, g, b } = tinycolor( color ).toRgb();
    return new Float32Array([ r / 255, g / 255, b / 255 ]);
}

var emptyTexture = { data: new Float32Array([ 1 ]), shape: [ 1, 1 ], stride: [ 1, 1 ] }

module.exports = select => select('.shader', el => {
    
    var position = require('../gl/position');
    // if ( !mouseRunning ) {
    //     updateMouse();
    //     mouseRunning = true;
    // }
    
    var options = JSON.parse( el.dataset.shaderOptions || '{}' );
    if ( options.tint ) options.tint = colorToVector( options.tint );
    
    var canvas = document.createElement( 'canvas' );
    canvas.classList.add( 'cover' );
    
    var gl = canvas.getContext( 'webgl' );
    
    var { uniforms, draw } = renderer( gl, frag );
    
    var imgs = [ ...el.querySelectorAll('img') ];
    var textures = imgs.map( _ => createTexture( gl, emptyTexture ) );
    Promise.all( imgs.map( onImageLoad ) ).then( imgs => {
        textures = imgs.map( img => {
            var tex = createTexture( gl, img );
            tex.magFilter = tex.minFilter = gl.LINEAR;
            return tex;
        });
        uniforms.texSize = vec2.fromValues( imgs[ 0 ].naturalWidth, imgs[ 0 ].naturalHeight )
        el.appendChild( canvas );
        tween( 1, 0, 1000, t => uniforms.transition = t );
    })
    var bounds = box.create();
    
    var onResize = () => {
        box.setFromElement( bounds, canvas );
        box.scale( bounds, bounds, window.devicePixelRatio );
        var scrollOffset = vec2.fromValues( window.pageXOffset * window.devicePixelRatio, window.pageYOffset * window.devicePixelRatio )
        box.translate( bounds, bounds, scrollOffset )
        canvas.width = bounds.max[ 0 ] - bounds.min[ 0 ];
        canvas.height = bounds.max[ 1 ] - bounds.min[ 1 ];
        gl.viewport( 0, 0, canvas.width, canvas.height );
    }
    
    uniforms.tint = options.tint;
    uniforms.transition = 1;
    
    var frame = null;
    var tick = () => {
        uniforms.center = vec2.scale( uniforms.center, position, window.devicePixelRatio );
        uniforms.boundsMin = bounds.min;
        uniforms.boundsMax = bounds.max;
        uniforms.time = ( Date.now() % DURATION ) / DURATION;
        textures.forEach( ( tex, i ) => {
            uniforms[ `texture${ i }` ] = tex.bind( i );
        })
        uniforms.frequency = .1 / window.devicePixelRatio;
        draw();
        frame = requestAnimationFrame( tick );
    }
    
    onResize();
    
    var onSizeChange = debounce( onResize, 100 );
    resizeObserver.observe( canvas, onSizeChange );
    
    var onIntersectionChange = entry => {
        if ( entry.isIntersecting && frame === null ) {
            tick();
        } else if ( !entry.isIntersecting && frame !== null ) {
            window.cancelAnimationFrame( frame );
            frame = null;
        }
    }
    
    intersectionObserver.observe( canvas, onIntersectionChange );
    
    return () => {
        window.cancelAnimationFrame( frame );
        resizeObserver.unobserve( canvas, onSizeChange );
        intersectionObserver.unobserve( canvas, onIntersectionChange );
        textures.forEach( texture => texture.dispose() );
    }
    
})