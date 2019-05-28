var loadedScripts = {};
var loadScript = url => new Promise( resolve => {
    if ( loadedScripts[ url ] ) {
        resolve();
    } else {
        var script = document.createElement( 'script' );
        script.onload = resolve;
        script.type = 'text/javascript';
        script.src = url;
        document.body.appendChild( script );
        loadedScripts[ url ] = true;
    }
})

module.exports = loadScript