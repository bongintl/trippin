module.exports = ( el, {
    draggingClass = null,
    onClick = null,
    tolerance = 10
} = {}) => {
    
    var startX = 0;
    var prevX = 0;
    var dragging = false;
    var prevDragTime, speed, then, frame;

    var onDown = e => {
        prevX = startX = e.clientX;
        prevDragTime = Date.now();
        el.classList.add( draggingClass );
        dragging = true;
        e.preventDefault();
        window.cancelAnimationFrame( frame );
    }
    
    var onMove = e => {
        if ( !dragging ) return;
        el.scrollLeft += prevX - e.clientX;
        var now = Date.now();
        speed = ( prevX - e.clientX ) / ( now - prevDragTime );
        prevX = e.clientX;
        prevDragTime = now;
    }
    
    var onUp = e => {
        el.classList.remove( draggingClass );
        dragging = false;
        if ( onClick && Math.abs( e.clientX - startX ) < tolerance ) {
            onClick( e );
        }
        then = Date.now();
        frame = requestAnimationFrame( tick );
    }
    
    var tick = () => {
        var now = Date.now();
        var dT = now - then;
        el.scrollLeft += speed * dT;
        speed *= .9;
        then = now;
        frame = requestAnimationFrame( tick );
    }
    
    el.addEventListener( 'mousedown', onDown );
    el.addEventListener( 'mousemove', onMove );
    el.addEventListener( 'mouseup', onUp );
    
    return () => {
        el.removeEventListener( 'mousedown', onDown );
        el.removeEventListener( 'mousemove', onMove );
        el.removeEventListener( 'mouseup', onUp );
        window.cancelAnimationFrame( frame );
    }
    
}

