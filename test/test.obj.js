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

var array_simple = [1,2,3];
var array_complex = [1,array_simple, 3];
var array_with_null = [1,null,3];
var array_falsy = [1,false,3];

// Based on the properties of the objects above
function checkClone(c, o1, o2) {
	c.a = 'foo';
	c.a.should.not.be.equal(o1.a);
	c.a.should.not.be.equal(o2.a);
};


describe('OBJ: ', function() {
    
describe('#clone() arrays', function() {
        
    	var copy_simple 	= JSUS.clone(array_simple);
    	var copy_complex 	= JSUS.clone(array_complex);
    	var copy_with_null	= JSUS.clone(array_with_null);
    	var copy_falsy		= JSUS.clone(array_falsy);
    	
    	// SIMPLE
        it('should return the copy of a simple object', function(){
        	copy_simple.should.eql(array_simple); 
        });
        
        it('modification to the copy of a simple object should not affect the original one', function(){
        	copy_simple[0] = 'foo';
        	copy_simple[0].should.not.be.equal(array_simple[0]);
        });
        
        // COMPLEX
        it('should return the copy of a complex object', function(){
           copy_complex.should.eql(array_complex); 
        });
        
        it('modification to the copy of a complex object should not affect the original one', function(){
        	copy_complex[0] = 'foo';
        	copy_complex[0].should.not.be.equal(array_complex[0]);
        });
        
        // NULL
        it('should return the copy of an object with NULL values', function(){
            copy_with_null.should.eql(array_with_null); 
        });
         
	    it('modification to the copy of an object with NULL values should not affect the original one', function(){
	    	copy_with_null[0] = 'foo';
	     	copy_with_null[0].should.not.be.equal(array_with_null[0]);
	    });
        
	    // FALSY
	    it('should return the copy of an object with FALSY values', function(){
	    	copy_falsy.should.eql(array_falsy); 
        });
         
	    it('modification to the copy of an object with FALSY values should not affect the original one', function(){
	    	copy_falsy[0] = 'foo';
	    	copy_falsy[0].should.not.be.equal(array_falsy[0]);
	    });
	    
        
    });
	
    describe('#clone() objects', function() {
        
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
    
    describe('#equals()', function() {
    	
    	it('should say that 1 and 1 are equal', function(){	
    		JSUS.equals(1, 1).should.be.true;
    	});
    	
    	it('should say that 1 and \'1\' are NOT equal', function(){	
    		JSUS.equals(1, '1').should.be.false;
    		JSUS.equals('1', 1).should.be.false;
    	});
    	
    	it('should say that "a" and "a" are equal', function(){	
    		JSUS.equals('a', 'a').should.be.true;
    		JSUS.equals("a", "a").should.be.true;
    	});
    	
    	it('should say that "a" and "b" are NOT equal', function(){	
    		JSUS.equals('a', 'b').should.be.false;
    		JSUS.equals('b', 'a').should.be.false;
    		JSUS.equals("a", "b").should.be.false;
    		JSUS.equals("b", "a").should.be.false;
    	});
    	
    	it('should say that "blah blah!" and "blah blah!" are equal', function(){	
    		JSUS.equals('blah blah!', 'blah blah!').should.be.true;
    		JSUS.equals("blah blah!", "blah blah!").should.be.true;
    	});
    	
    	it('should say that undefined and undefined are equal', function(){	
    		JSUS.equals(undefined, undefined).should.be.true;
    	});
    	
    	it('should say that null and null are equal', function(){	
    		JSUS.equals(null, null).should.be.true;
    	});
    	
    	it('should say that false and false are equal', function(){	
    		JSUS.equals(false, false).should.be.true;
    	});
    	
    	it('should say that true and true are equal', function(){	
    		JSUS.equals(true, true).should.be.true;
    	});
    	
    	it('should say that false and true are NOT equal', function(){	
    		JSUS.equals(false, true).should.be.false;
    	});
    	
    	it('should say that 0 and 0 are equal', function(){	
    		JSUS.equals(0, 0).should.be.true;
    	});
    	
    	it('should say that NaN and NaN are equal', function(){	
    		JSUS.equals(NaN, NaN).should.be.true;
    	});
    	
    	it('should say that Infinity and Infinity are equal', function(){	
    		JSUS.equals(Infinity, Infinity).should.be.true;
    	});
    	
    	it('should say that two simple objects are equal', function(){	
    		JSUS.equals(obj_simple, obj_simple).should.be.true;
    	});
    	
    	it('should say that two complex objects are equal', function(){	
    		JSUS.equals(obj_complex, obj_complex).should.be.true;
    	});
    	
    	it('should say that two falsy objects are equal', function(){	
    		JSUS.equals(obj_falsy, obj_falsy).should.be.true;
    	});
    	
    	it('should say that two objects with nulls are equal', function(){	
    		JSUS.equals(obj_with_null, obj_with_null).should.be.true;
    	});    	
    	
    });
    
    
    describe('#hasOwnNestedProperty()', function() {
    	
    	it('should return TRUE for complex_obj', function(){	
    		JSUS.hasOwnNestedProperty('b.a', obj_complex).should.be.true;
    	});
    	
    	it('should return FALSE for simple_obj', function(){	
    		JSUS.hasOwnNestedProperty('b.a', obj_simple).should.be.false;
    	});
    });
    
    
    describe('#join()', function() {
    	
    	var a = {b:2, c:3, f:5};
		var b = {a:10, b:2, c:100, d:4};

    	it('should return TRUE for complex_obj', function(){
    		JSUS.join(a,b).should.be.eql({b:2, c:100, f:5})
    	});
    });
    
    describe('#implode()', function() {
    	it('should return TRUE for complex_obj', function(){
    		JSUS.implode(obj_complex).should.be.eql([{a:1}, {b: obj_simple}, {c:3}]);
    	});
    });
    
    describe('#deleteNestedKey()', function() {
    	var copy_complex;
    	beforeEach(function(){
    		copy_complex = JSUS.clone(obj_complex);
    	})
    	it('should return TRUE for complex_obj', function() {
    		JSUS.deleteNestedKey('b.c', copy_complex).should.be.true;
    	});
    	it('should delete nested property from complex object', function() {
    		JSUS.deleteNestedKey('b.c', copy_complex);
    		copy_complex.should.be.eql({a:1, b:{a:1, b:2}, c:3});
    	});
    	it('should delete first-level property from complex object', function() {
    		JSUS.deleteNestedKey('b', copy_complex);
    		copy_complex.should.be.eql({a:1, c:3});
    	});    	
    	it('should return FALSE when nested property does not exist', function() {
    		JSUS.deleteNestedKey('b.c.a.g', copy_complex).should.be.false;
    	});
    });
    
});



