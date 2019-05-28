var dragScroll = require('../utils/dragScroll');

module.exports = select => select( '.drag', el => {
    return dragScroll( el, { draggingClass: 'dragging' });
})



// module.exports = select => select( '.drag', drag => {
//     var dragging = false;
//     var prevX; 
//     drag.onmousedown = function(e) {
//         e.preventDefault();
//         dragging = true;
//         drag.classList.add( 'dragging' );
//         prevX = e.clientX; 
//     }
//     drag.onmousemove = function(e){ 
        
//         if (dragging) {
//             drag.scrollLeft += prevX - e.clientX;
//             prevX = e.clientX;
//         }
        
//     }
//     drag.onmouseup = function(e) {
//         dragging = false;
//         drag.classList.remove( 'dragging' );
//     }
// })

// module.exports = function() {
   
//     var drag = document.querySelectorAll(".drag");
//     var dragging = false;
//     var prevX; 
    
//     drag.forEach(function(el){
//         el.onmousedown = function(e) {
//             e.preventDefault();
//             dragging = true;
//             el.classList.add( 'dragging' );
//             prevX = e.clientX; 
//         }
//         el.onmousemove = function(e){ 
            
//             if (dragging) {
//                 el.scrollLeft += prevX - e.clientX;
//                 prevX = e.clientX;
//             }
            
//         }
//         el.onmouseup = function(e) {
//             dragging = false;
//             el.classList.remove( 'dragging' );
//         }
//     })

   

   
    
//     // var prevX = 0;
//     // var dragging = false;

//     // var onDown = e => {
//     //     prevX = e.clientX;
//     //     draggable.classList.add( draggingClass );
//     //     dragging = true;
//     //     e.preventDefault();
//     //     console.log('dargging');
//     // }
    
//     // var onUp = () => {
//     //     draggable.classList.remove( draggingClass );
//     //     dragging = false;
//     // }
    
//     // var onMove = e => {
//     //     draggable.scrollLeft += prevX - e.clientX;
//     //     prevX = e.clientX;
//     // }
    
//     // draggable.addEventListener( 'mousedown', onDown );
//     // draggable.addEventListener( 'mousemove', onMove );
//     // draggable.addEventListener( 'mouseup', onUp );
    
    
// }

// module.exports = function() {
   
//     var drag = document.querySelectorAll(".drag");
//     var dragging = false;
    
//     drag.forEach(function(el){
//         el.onmousedown = function(e) {
//             e.preventDefault();
//             dragging = true;
//             el.classList.add( 'dragging' );
//             prevX = e.clientX; 
//         }
//         el.onmousemove = function(e){ 
            
//             if (dragging) {
//                 el.scrollLeft += prevX - e.clientX;
//                 prevX = e.clientX;
//             }
            
//         }
//         el.onmouseup = function(e) {
//             dragging = false;
//             el.classList.remove( 'dragging' );
//         }
//     })

   

   
    
//     // var prevX = 0;
//     // var dragging = false;

//     // var onDown = e => {
//     //     prevX = e.clientX;
//     //     draggable.classList.add( draggingClass );
//     //     dragging = true;
//     //     e.preventDefault();
//     //     console.log('dargging');
//     // }
    
//     // var onUp = () => {
//     //     draggable.classList.remove( draggingClass );
//     //     dragging = false;
//     // }
    
//     // var onMove = e => {
//     //     draggable.scrollLeft += prevX - e.clientX;
//     //     prevX = e.clientX;
//     // }
    
//     // draggable.addEventListener( 'mousedown', onDown );
//     // draggable.addEventListener( 'mousemove', onMove );
//     // draggable.addEventListener( 'mouseup', onUp );
    
    
// }

