module.exports = select => select( '.nav-compact', el => {
    var menu = el.querySelector('.nav-compact__menu');
    [ ...el.querySelectorAll('.toggle-menu') ].forEach( button => {
        button.addEventListener( 'click', () => {
            menu.classList.toggle( "nav-compact__menu--open" );
        })
    })
})
    
    // var toggleButtons = document.getElementsByClassName("toggle-menu");
    // var menu = document.querySelector(".nav-compact__menu");
    // var classToToggle = "nav-compact__menu--open";
    
    // for (var i = 0; i < toggleButtons.length; i++) {
    //     toggleButtons[i].onclick = function() {
    //         if(menu.classList.contains(classToToggle)){
    //             menu.classList.remove(classToToggle)
    //         } else {
    //             menu.classList.add(classToToggle)
    //         }
    //     }
    // }
    
// }