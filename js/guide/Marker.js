var vec2 = require('gl-vec2');
var box = require('../utils/box');
var vec2Utils = require('../utils/vec2');
var { Body, Box, Circle, LinearSpring } = require('p2');


module.exports = class Marker {
    
    constructor ( el, latLng, position = vec2.create() ) {
        
        this.el = el;
        this.latLng = latLng;
        this.position = position;
        this.offset = vec2.create();
        this.scale = 1;
        this.mode = 'physical'
        
        this.body = new Body({
            mass: 5,
            position,
            fixedRotation: true
        });
        // this.body.allowSleep = true
        this.body.damping = .9999;
        
        this.anchor = new Body({ position });
        this.spring = new LinearSpring( this.body, this.anchor, {
            restLength: 0,
            stiffness: 200,
            damping: 10
        });
        
        this.dot = el.querySelector('.marker__dot');
        this.label = el.querySelector('.marker__label');
        this.radius = 0;
        this.labelBounds = box.create();
        this.labelVisible = false;
        window.addEventListener( 'resize', this.measure.bind( this ) );

        this.measure();
        
    }
    
    setPosition ( position, force ) {
        vec2.copy( this.anchor.position, position );
        if ( force ) {
            vec2.copy( this.body.previousPosition, position );
            vec2.copy( this.body.position, position );
            this.body.setZeroForce();
        }
    }
    
    measure () {
        
        var offset = vec2Utils.elementPosition( vec2.create(), this.el );
        vec2.negate( offset, offset );
        this.labelVisible = getComputedStyle( this.label ).display !== 'none';
        if ( this.labelVisible ) {
            box.setFromElement( this.labelBounds, this.label );
            box.translate( this.labelBounds, this.labelBounds, offset );
        }
        this.radius = this.dot.clientWidth / 2 + 1;
        
        this.setScale( this.scale );
        
    }
    
    setScale ( scale ) {

        this.scale = scale;
        
        this.body.shapes.forEach( shape => {
            this.body.removeShape( shape );
        });
        
        this.body.addShape( new Circle({ radius: this.radius * scale }) );
        
        if ( this.labelVisible ) {
            var labelSize = box.size( vec2.create(), this.labelBounds );
            vec2.scale( labelSize, labelSize, scale );
            this.body.addShape( new Box({
                width: labelSize[ 0 ],
                height: labelSize[ 1 ],
                position: vec2.scale( vec2.create(), this.labelBounds.min, scale )
            }))
        }
        
    }
    
    render ( position ) {
        var [ x, y ] = position;
        this.el.style.transform = `translate(${ x }px, ${ y }px)`;
    }
    
    // render () {
    //     var [ x, y ] = vec2.add( vec2.create(), this.position, this.offset );
    //     this.el.style.transform = `translate(${ x }px, ${ y }px)`;
    // }
}