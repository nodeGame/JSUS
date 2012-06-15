var util = require('util');
    should = require('should'),
    JSUS = require('./../jsus').JSUS;
    
    
var obj_simple = {
	a: 1,
	b: 2,
	c: 3,
};

// If update, update also getAllKeys test
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

// Based on the properties of the objects above
function checkClone(c, o1, o2) {
	c.a = 'foo';
	c.a.should.not.be.equal(o1.a);
	c.a.should.not.be.equal(o2.a);
};


describe('OBJ: ', function() {
    
    describe('#clone()', function() {
        
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
    
    // Merging in SIMPLE
    ///////////////////////////////////////////////////////
    
    describe('#merge() COMPLEX obj in SIMPLE', function() {
    	
    	var simple_complex = JSUS.merge(obj_simple, obj_complex);
    	
    	// Merge complex in simple
	    it('should merge the second in the first object', function(){
	    	simple_complex.should.eql(obj_complex); 
        });
         
	    it('modification to the merged object should affect any of the merging ones', function(){
	    	checkClone(simple_complex, obj_simple, obj_complex);
	    });	
    });
    
    describe('#merge() obj with NULL in SIMPLE', function() {
    	
    	var simple_null = JSUS.merge(obj_simple, obj_with_null);
    	
    	// Merge null in simple
	    it('should merge the second in the first object', function(){
	    	simple_null.should.eql(obj_with_null); 
        });
         
	    it('modification to the merged object should affect any of the merging ones', function(){
	    	checkClone(simple_null, obj_simple, obj_with_null);
	    });
    	
    });
    
    describe('#merge() obj with FALSY values in SIMPLE', function() {
    	
    	var simple_falsy = JSUS.merge(obj_simple, obj_falsy);
    	
    	// Merge null in simple
	    it('should merge the second in the first object', function(){
	    	simple_falsy.should.eql(obj_falsy); 
        });
         
	    it('modification to the merged object should affect any of the merging ones', function(){
	    	checkClone(simple_falsy, obj_simple, obj_falsy);
	    });
    	
    });
    
    // Merging SIMPLE into other objects
    ///////////////////////////////////////////////////////

    describe('#merge() SIMPLE in COMPLEX obj', function() {
    	
    	var complex_simple = JSUS.merge(obj_complex, obj_simple);
    	
    	// Merge complex in simple
	    it('should merge the second in the first object', function(){
	    	complex_simple.should.eql(obj_simple); 
        });
         
	    it('modification to the merged object should affect any of the merging ones', function(){
	    	checkClone(complex_simple, obj_complex, obj_simple);
	    });	
    });
    
    describe('#merge() SIMPLE in obj with NULL', function() {
    	
    	var null_simple = JSUS.merge(obj_with_null, obj_simple);
    	
    	// Merge null in simple
	    it('should merge the second in the first object', function(){
	    	null_simple.should.eql(obj_simple); 
        });
         
	    it('modification to the merged object should affect any of the merging ones', function(){
	    	checkClone(null_simple, obj_with_null, obj_simple);
	    });
    	
    });
    
    describe('#merge() SIMPLE in obj with FALSY values ', function() {
    	
    	var falsy_simple = JSUS.merge(obj_falsy, obj_simple);
    	
    	// Merge null in simple
	    it('should merge the second in the first object', function(){
	    	falsy_simple.should.eql(obj_simple); 
        });
         
	    it('modification to the merged object should affect any of the merging ones', function(){
	    	checkClone(falsy_simple, obj_falsy, obj_simple);
	    });
    	
    });
    
    // Merging mixed objects
    ///////////////////////////////////////////////////////

    describe('#merge() COMPLEX obj in obj with NULL', function() {
    	
    	var null_complex = JSUS.merge(obj_with_null, obj_complex);
    	
    	// Merge complex in simple
	    it('should merge the second in the first object', function(){
	    	null_complex.should.eql(obj_complex); 
        });
         
	    it('modification to the merged object should affect any of the merging ones', function(){
	    	checkClone(null_complex, obj_with_null, obj_complex);
	    });	
    }); 
    
    describe('#merge() COMPLEX obj in obj with FALSY values', function() {
    	
    	var falsy_complex = JSUS.merge(obj_falsy, obj_complex);
    	
    	// Merge complex in simple
	    it('should merge the second in the first object', function(){
	    	falsy_complex.should.eql(obj_complex); 
        });
         
	    it('modification to the merged object should affect any of the merging ones', function(){
	    	checkClone(falsy_complex, obj_falsy, obj_complex);
	    });	
    }); 
    
    
    describe('#mergeOnKey()', function() {
      
    	var merge_in = {
    			a: {max: 10, 
    				min: 1,
    				value: 3,
    			},
    			b: {max: 100, 
    				min: 0,
    				value: 90,
    			},
    			c: {max: 1, 
    				min: -1,
    			},
    			d: {
    				max: 0,
    				min: 100,
    				value: {
    					a: 1,
    					b: 2,
    				},
    			},
    			e: {},
    	};
    	
    	var merge_out = {
    			a: 10,
    			b: 5,
    			c: 0,
    			d: 1000,
    			e: 2,
    			f: 100,
    	};
    	
    	var o = JSUS.mergeOnKey(merge_in, merge_out, 'value');
    	
    	it('should merge the second in the first object in the key value', function(){	
    		o.f.should.exist;
 	    	o.c.value.should.exist;
 	    	o.a.value.should.be.eql(merge_out.a);
 	    	o.b.value.should.be.eql(merge_out.b);
 	    	o.c.value.should.be.eql(merge_out.c);
 	    	o.d.value.should.be.eql(merge_out.d);
 	    	o.e.value.should.be.eql(merge_out.e);
 	    	o.f.value.should.be.eql(merge_out.f);
    	});
    	
    	it('should not overwrite other properties', function(){	
    		o.a.max.should.exist;
 	    	o.a.min.should.exist;
 	    	o.a.max.should.be.eql(merge_in.a.max);
    	});
    	
	    it('modification to the merged object should affect any of the merging ones', function(){
	    	checkClone(o, merge_in, merge_out);
	    });	
    });
    
    
    describe('#keys()', function() {
    	
    	it('should returns all the first level keys', function(){	
    		JSUS.keys(obj_complex).should.be.eql(['a','b','c']);
    	});
    	
    	it('should returns all the first level keys with negative number', function(){	
    		JSUS.keys(obj_complex, -1).should.be.eql(['a','b','c']);
    	});
    	
    	it('should returns all the first and second level keys with the nested option enabled', function(){	
    		JSUS.keys(obj_complex, 1).should.be.eql([ 'a', 'b', 'a', 'b', 'c', 'c' ]);
    	});	
    	
    	
    });
    
});


