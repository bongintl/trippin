var ResizeObserver = require( 'resize-observer-polyfill' );
var createObserver = require('./observer');
module.exports = createObserver( ResizeObserver );