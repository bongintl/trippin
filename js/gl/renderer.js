var createShader = require('gl-shader');
var createBuffer = require('gl-buffer');
var createVAO = require('gl-vao');

var vert = `
    precision highp float;
    attribute vec2 position;
    void main () {
        gl_Position = vec4( position, 0., 1. );
    }
`

module.exports = ( gl, frag ) => {
    
    var shader = createShader( gl, vert, frag );

    var position = createBuffer( gl, new Float32Array([
        -1, -1,
        -1, 3,
        3, -1
    ]))
    var triangle = createVAO( gl, [{
        buffer: position,
        type: gl.FLOAT,
        size: 2
    }]);
    
    gl.enable( gl.BLEND );
    gl.disable( gl.DEPTH_TEST );
    
    shader.bind();
    triangle.bind();
    
    return {
        uniforms: shader.uniforms,
        draw: () => {
            gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT );
            gl.drawArrays( gl.TRIANGLES, 0, 3 );
        }
    }
    
}