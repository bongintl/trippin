var renderer = require('./renderer');
var glslify = require('glslify');

var frag = glslify(`
    precision highp float;
    uniform vec2 size;
    uniform sampler2D img;
    uniform bool flip;
    uniform vec2 direction;

    #pragma glslify: blur = require('glsl-fast-gaussian-blur')

    void main() {
        vec2 uv = vec2(gl_FragCoord.xy / size );
        gl_FragColor = blur( tex, uv, size, direction );
    }
`)

module.exports = img => {
    
}