var util = require('util');
    should = require('should'),
    JSUS = require('./../jsus').JSUS;
    
    
var obj_simple = {
	a: 1,
	b: 2,
	c: 3,
};

var obj_complex = {
	a: 1,
	b: obj_simple,
	c: 3,
};

var obj_with_null = {
	a: 1,
	b: null,
	c: 3,
};

var obj_falsy = {
	a: 0,
	b: false,
	c: 3,
};


describe('OBJ: ', function(){
    
    // removeElement
    describe('#clone()', function(){
        
    	var copy_simple 	= JSUS.clone(obj_simple);
    	var copy_complex 	= JSUS.clone(obj_complex);
    	var copy_with_null	= JSUS.clone(obj_with_null);
    	var copy_falsy		= JSUS.clone(obj_falsy);
    	
    	// SIMPLE
        it('should return the copy of a simple object', function(){
        	copy_simple.should.eql(obj_simple); 
        });
        
        it('modification to the copy of a simple object should not affect the original one', function(){
        	copy_simple.a = 'foo';
        	copy_simple.a.should.not.be.equal(obj_simple.a);
        });
        
        // COMPLEX
        it('should return the copy of a complex object', function(){
           copy_complex.should.eql(obj_complex); 
        });
        
        it('modification to the copy of a complex object should not affect the original one', function(){
        	copy_complex.a = 'foo';
        	copy_complex.a.should.not.be.equal(obj_complex.a);
        });
        
        // NULL
        it('should return the copy of an object with NULL values', function(){
            copy_with_null.should.eql(obj_with_null); 
        });
         
	    it('modification to the copy of an object with NULL values should not affect the original one', function(){
	    	copy_with_null.a = 'foo';
	     	copy_with_null.a.should.not.be.equal(obj_with_null.a);
	    });
        
	    // FALSY
	    it('should return the copy of an object with FALSY values', function(){
	    	copy_falsy.should.eql(obj_falsy); 
        });
         
	    it('modification to the copy of an object with FALSY values should not affect the original one', function(){
	    	copy_falsy.a = 'foo';
	    	copy_falsy.a.should.not.be.equal(obj_falsy.a);
	    });
	    
        
    });
    
});


