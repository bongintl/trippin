var html = require('nanohtml');
var morph = require('nanomorph');
var bem = require('bem-classname');
var dragScroll = require('../utils/dragScroll');

var css = obj => Object.entries( obj ).map( ([ key, value ]) => `${ key }: ${ value }`).join('; ');

var measure = ( state, tree ) => {
    state.expandedWidth = tree.querySelector('.spot__slider').clientWidth;
    state.collapsedWidth = tree.querySelector('.spot__thumbnail').clientWidth;
    state.maxImageWidth = state.expandedWidth - 20;
    state.maxImageHeight = Math.floor( Math.max( ...state.images.map( ({ ratio }) => state.maxImageWidth * ratio ) ) )
    state.expandedHeight = Math.floor( Math.min( state.maxImageHeight, window.innerHeight * .8 ) );
    state.collapsedHeight = Math.floor( Math.min( state.expandedHeight, state.collapsedWidth * state.images[ 0 ].ratio ) );
    state.measured = true;
}

var render = state => {
    var height = state.measured
        ? ( state.expanded ? state.expandedHeight : state.collapsedHeight ) + 'px'
        : 'auto'
    return html`
        <div class='spot__images' style="${ css( { height } ) }">
            ${ renderSliderContainer( state ) }
            ${ renderThumbnailContainer( state ) }
        </div>
    `
}

var renderSliderContainer = state => html`
    <div class="s-col-12 spot__slider-container">
        <div
            class="spot__slider rounded"
            style="${ css({
                height: state.measured ? state.expandedHeight + 'px' : 'auto'
            }) }"
        >
            ${ state.measured && renderSlider( state ) }
        </div>
    </div>
`

var renderThumbnailContainer = state => html`
    <div class="s-col-10 m-col-6 xl-col-4 spot__thumbnail-container">
        <div
            class="spot__thumbnail"
            style="${ css({
                height: state.measured ? state.collapsedHeight + 'px' : 'auto',
            }) }"
        >
            ${ state.measured && renderThumbnail( state ) }
        </div>
    </div>
`

var renderThumbnail = state => html`
    <img
        onclick="${ state.toggle }"
        srcset="${ state.images[ 0 ].srcset }"
        style="${ css({
        }) }"
    />
`

var renderSlider = state => html`
    <div
        class="spot__slider-scroll${ state.dragging ? ' spot__slider-scroll--dragging' : '' }"
        onmousedown=${ state.onmousedown }
        onmousemove=${ state.onmousemove }
        onmouseup=${ state.onmouseup }
    >
        ${ state.images.map( ({ srcset, ratio }) => {
            var width = Math.min( state.maxImageWidth, state.expandedHeight / ratio );
            var height = width * ratio;
            return html`<img
                class="rounded"
                srcset=${ srcset }
                sizes="${ width }px"
                style="${ css({ width: width + 'px', height: height + 'px' }) }"
            />`;
        }) }
    </div>
`;

module.exports = document => [ ...document.querySelectorAll('.spot') ].forEach( el => {
    var imagesContainer = el.querySelector( '.spot__images' );
    var state = {
        images: JSON.parse( imagesContainer.querySelector( 'script' ).innerText ),
        expanded: false,
        measured: false,
        dragging: false,
        startX: 0,
        prevX: 0,
        toggle: () => {
            state.expanded = !state.expanded;
            update();
        },
        onmousedown: e => {
            state.prevX = state.startX = e.clientX;
            state.dragging = true;
            e.preventDefault();
            update();
        },
        onmousemove: e => {
            if ( !state.dragging ) return;
            e.currentTarget.scrollLeft += state.prevX - e.clientX;
            state.prevX = e.clientX;
        },
        onmouseup: e => {
            state.dragging = false;
            if ( Math.abs( e.clientX - state.startX ) < 10 ) {
                state.toggle();
            } else {
                update();
            }
        }
    };
    var tree = render( state );
    var update = () => {
        el.classList.toggle( 'spot--expanded', state.expanded );
        morph( tree, render( state ) );
    };
    window.addEventListener( 'resize', () => {
        measure( state, tree );
        update();
    });
    imagesContainer.parentNode.replaceChild( tree, imagesContainer );
    measure( state, tree );
    update();
});