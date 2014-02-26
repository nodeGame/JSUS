var util = require('util');
should = require('should'),
JSUS = require('./../jsus').JSUS;

var a = 0;
var b = 100000;
var v = [];

describe('RANDOM: ', function(){
    
    describe('#random()', function(){
	before(function(){
	    v = [];
	    for (var i = a; i < b; i++) {
		v.push(JSUS.random(a,b));
	    }
	});
	
	it('should be within (a,b).', function() {
	    var found_b = false;
	    var found_a = false;
	    for (var i=0; i< v.length; i++) {	
		if (v[i] === b) found_b = true;
		if (v[i] === a) found_a = true;
		v[i].should.be.within(a,b);
	    }
	    
	    found_b.should.be.false;
	    found_a.should.be.false;
	    
	    
	});		
	
	
    });
    
    describe('#randomInt()', function() {
	var found_b = false;
	var found_a = false;
	
	before(function(){
	    v = [];
	    for (var i = a; i < b; i++) {
		var n = JSUS.randomInt(a,b);
		if (n === b) found_b = true;
		if (n === a) found_a = true;
		v.push(n);
	    }
	});
	
	it('should be within (a,b].', function() {
	    for (var i=0; i< v.length; i++) {	
		v[i].should.be.within(a,(b+1));
	    }			
	});
	
	it('should be within (a,b]. a should never be found', function() {
	    found_a.should.be.false;
	});

        // Removed for now. It is not significant
        //		it('should be within (a,b]. b should never be found (can fail)', function() {
        //			found_b.should.be.true;
        //		});
	
    });
    
});


