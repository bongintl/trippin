var map = ( x, oldMin, oldMax, newMin, newMax ) => (
    newMin + ( x - oldMin ) / ( oldMax - oldMin ) * ( newMax - newMin )
);

module.exports = { map };