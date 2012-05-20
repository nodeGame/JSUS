var util = require('util');
    should = require('should'),
    JSUS = require('./../jsus').JSUS;
    
var a = 0;
var b = 1000;
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
    
	describe('#randomInt()', function(){
		before(function(){
			v = [];
			for (var i = a; i < b; i++) {
				v.push(JSUS.randomInt(a,b));
			}
		});
	
		it('should be within (a,b]. Notice: It can fails when it checks for b', function() {
			var found_b = false;
			var found_a = false;
			for (var i=0; i< v.length; i++) {	
				if (v[i] === b) found_b = true;
				if (v[i] === a) found_a = true;
				v[i].should.be.within(a,(b+1));
			}
	
			found_b.should.be.true;
			found_a.should.be.false;
			
			
		});		
		
	});
    
});


