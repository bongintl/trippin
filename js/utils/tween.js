module.exports = ( from, to, duration, onProgress ) => {
    var startTime = Date.now();
    var endTime = startTime + duration;
    var frame;
    var tick = () => {
        var now = Date.now();
        if ( now >= endTime ) {
            onProgress( to );
        } else {
            onProgress( from + ( now - startTime ) / duration * ( to - from ) );
            frame = window.requestAnimationFrame( tick );
        }
    }
    tick();
    return () => window.cancelAnimationFrame( frame );
}