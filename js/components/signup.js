module.exports = select => select('.footer', el => {
    var modal = el.querySelector('#signup');
    [ ...el.querySelectorAll('#signup-button, #signup-close') ].forEach( button => {
        button.addEventListener( 'click', () => {
            console.log('test')
            modal.classList.toggle('signup--open');
        })
    })
})

// module.exports = document => {
    
//     var signupButton = document.querySelector('#signup-button');
//     var signupClose = document.querySelector('#signup-close');
//     var signup = document.querySelector('#signup');
    
//     if ( signupButton ) {
    
//         signupButton.onclick = function() {
//              signup.classList.add('signup--open')
//         }
        
//         signupClose.onclick = function() {
//              signup.classList.remove('signup--open')
//         }
    
//     }
// }
