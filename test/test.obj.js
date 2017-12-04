var util = require('util');
should = require('should'),
JSUS = require('./../jsus').JSUS;


var f = function(a,b) { console.log(a + b); };
var fcopy = function(a,b) { console.log(a + b); };

var f2 = function(a,b) { console.log(); };

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

var obj_with_array = {
    a: 1,
    b: [1, 2],
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

var obj_func = {
    a: 0,
    b: function (arg1, arg2) {
        return arg1 + arg2;
    },
    c: 3,
};

var obj_with_array_of_obj = {
    a: 1,
    b: [ {a:1}, {b: 2} ],
    c: 3,
};


var obj;
obj = {
    a1: { a2: { a3: "a", b3: { b4: { b5: "b" }  } } }
};

var array_simple = [1,2,3];
var array_complex = [1, array_simple, 3];
var array_with_null = [1,null,3];
var array_falsy = [1,false,3];
var array_func = [1, obj_func.b, 3];

// Based on the properties of the objects above
function checkClone(c, o1, o2) {
    c.a = 'foo';
    c.a.should.not.be.equal(o1.a);
    c.a.should.not.be.equal(o2.a);
};

var objkeys = { a:1, b:2, c:3, d: 4, e: 1};

describe('OBJ: ', function() {

    describe('#clone() arrays', function() {

        var copy_simple         = JSUS.clone(array_simple);
        var copy_complex        = JSUS.clone(array_complex);
        var copy_with_null      = JSUS.clone(array_with_null);
        var copy_falsy          = JSUS.clone(array_falsy);
        var copy_func           = JSUS.clone(array_func);

        // SIMPLE
        it('should return the copy of a simple object', function() {
            copy_simple.should.eql(array_simple);
        });

        it('modifying a copy of a simple object should not affect original',
           function() {

               copy_simple[0] = 'foo';
               copy_simple[0].should.not.be.equal(array_simple[0]);
           });

        // COMPLEX
        it('should return the copy of a complex object', function() {
            copy_complex.should.eql(array_complex);
        });

        it('modifying a copy of a complex object should not affect original',
           function() {

               copy_complex[0] = 'foo';
               copy_complex[0].should.not.be.equal(array_complex[0]);
           });

        // NULL
        it('should return the copy of an object with NULL values', function() {
            copy_with_null.should.eql(array_with_null);
        });

        it('modifying a copy of object with NULLs should not affect original',
           function() {

               copy_with_null[0] = 'foo';
               copy_with_null[0].should.not.be.equal(array_with_null[0]);
           });

        // FALSY
        it('should return the copy of an object with FALSY values', function() {
            copy_falsy.should.eql(array_falsy);
        });

        it('modifying a copy of object with FALSYs should not affect original',
           function() {

               copy_falsy[0] = 'foo';
               copy_falsy[0].should.not.be.equal(array_falsy[0]);
           });

        it('cloned functions should return the same value', function() {
            copy_func[1](1,1).should.be.eql(array_func[1](1,1));
        });

        it('modifying copy of object with functions should not affect original',
           function() {

               copy_func[1] = 'foo';
               copy_func[1].should.not.be.equal(array_func[1]);
           });


    });

    describe('#clone() objects', function() {

        var copy_simple         = JSUS.clone(obj_simple);
        var copy_complex        = JSUS.clone(obj_complex);
        var copy_with_null      = JSUS.clone(obj_with_null);
        var copy_falsy          = JSUS.clone(obj_falsy);
        var copy_func           = JSUS.clone(obj_func)
        var copy_with_array     = JSUS.clone(obj_with_array)
        var copy_with_array_of_obj = JSUS.clone(obj_with_array_of_obj)

        // SIMPLE
        it('should return the copy of a simple object', function() {
            copy_simple.should.eql(obj_simple);
        });

        it('modifying a copy of a simple object should not affect original',
           function() {

               copy_simple.a = 'foo';
               copy_simple.a.should.not.be.equal(obj_simple.a);
           });

        // COMPLEX
        it('should return the copy of a complex object', function() {
            copy_complex.should.eql(obj_complex);
        });

        it('modifying a copy of a complex object should not affect original',
           function() {

               copy_complex.a = 'foo';
               copy_complex.a.should.not.be.equal(obj_complex.a);
           });

        // NULL
        it('should return the copy of an object with NULL values', function() {
            copy_with_null.should.eql(obj_with_null);
        });

        it('modifying copy of object with NULLs should not affect original',
           function() {

               copy_with_null.a = 'foo';
               copy_with_null.a.should.not.be.equal(obj_with_null.a);
           });

        // FALSY
        it('should return the copy of an object with FALSY values', function() {
            copy_falsy.should.eql(obj_falsy);
        });

        it('modifying copy of an object with FALSYs should not affect original',
           function() {

               copy_falsy.a = 'foo';
               copy_falsy.a.should.not.be.equal(obj_falsy.a);
           });

        // FUNC
        it('should return the copy of an object containing functions',
           function() {

               copy_func.should.eql(obj_func);
           });

        it('cloned functions should return the same value', function() {
            copy_func.b(1,1).should.be.eql(obj_func.b(1,1));
        });

        it('modifying copy of object with functions should not affect original',
           function() {

               copy_func.b = 'foo';
               copy_func.b.should.not.be.equal(obj_func.b);
           });

        // ARRAY
        it('should return the copy of an object containing array of objs',
           function() {
               copy_with_array.should.eql(obj_with_array);
           });

        it('cloned obj with array of obj should be the same', function() {
            copy_with_array.b[0].should.be.eql(obj_with_array.b[0]);
        });

        it('modifying copy of obj with array of obj should not affect original',
           function() {

               copy_with_array.b[0] = -1;
               copy_with_array.b[0].should.not.be.equal(obj_with_array.b[0]);
           });

        // ARRAY OF OBJ
        it('should return the copy of an object containing array of objs',
           function() {
               copy_with_array_of_obj.should.eql(obj_with_array_of_obj);
           });

        it('cloned obj with array of obj should be the same', function() {
            copy_with_array_of_obj.b[0].a
                .should.be.eql(obj_with_array_of_obj.b[0].a);
        });

        it('modifying copy of obj with array of obj should not affect original',
           function() {

               copy_with_array_of_obj.b[0].a = -1;
               copy_with_array_of_obj.b[0].a
                   .should.not.be.equal(obj_with_array_of_obj.b[0].a);
           });

    });

    describe('#clone() functions', function() {

        var clone_func = JSUS.clone(obj_func.b);

        it('cloned functions should return the same value', function() {
            clone_func(1,1).should.be.eql(obj_func.b(1,1));
        });

        it('modifying copy of object with functions should not affect original',
           function() {

               clone_func = function(a,b) {return a-b;};
               clone_func.should.not.be.equal(obj_func.b);
           });


    });



    // Merging in SIMPLE
    ///////////////////////////////////////////////////////

    describe('#merge() COMPLEX obj in SIMPLE', function() {

        var simple_complex = JSUS.merge(obj_simple, obj_complex);

        // Merge complex in simple
        it('should merge the second in the first object', function() {
            simple_complex.should.eql(obj_complex);
        });

        it('modifying merged object should affect any of the merging ones',
           function() {

               checkClone(simple_complex, obj_simple, obj_complex);
           });
    });

    describe('#merge() obj with NULL in SIMPLE', function() {

        var simple_null = JSUS.merge(obj_simple, obj_with_null);

        // Merge null in simple
        it('should merge the second in the first object', function() {
            simple_null.should.eql(obj_with_null);
        });

        it('modifying merged object should affect any of the merging ones',
           function() {

               checkClone(simple_null, obj_simple, obj_with_null);
           });

    });

    describe('#merge() obj with array in SIMPLE', function() {

        var simple_array = JSUS.merge(obj_simple, obj_with_array);

        // Merge null in simple
        it('should merge the second in the first object', function() {
            simple_array.should.eql(obj_with_array);
        });

        it('modifying the merged object should affect any of the merging ones',
           function() {

               checkClone(simple_array, obj_simple, obj_with_array);
           });

    });

    describe('#merge() obj with FALSY values in SIMPLE', function() {

        var simple_falsy = JSUS.merge(obj_simple, obj_falsy);

        // Merge null in simple
        it('should merge the second in the first object', function() {
            simple_falsy.should.eql(obj_falsy);
        });

        it('modifying the merged object should affect any of the merging ones',
           function() {

               checkClone(simple_falsy, obj_simple, obj_falsy);
           });

    });

    describe('#merge() obj with functions values in SIMPLE', function() {

        var simple_func = JSUS.merge(obj_simple, obj_func);

        it('modifying the merged object should affect any of the merging ones',
           function() {

               checkClone(simple_func, obj_simple, obj_func);
           });

        it('merged functions should return the same value', function() {
            simple_func.b(1,1).should.be.eql(obj_func.b(1,1));
        });

    });

    // Merging SIMPLE into other objects
    ///////////////////////////////////////////////////////

    describe('#merge() SIMPLE in COMPLEX obj', function() {

        var complex_simple = JSUS.merge(obj_complex, obj_simple);

        // Merge complex in simple
        it('should merge the second in the first object', function() {
            complex_simple.should.eql(obj_simple);
        });

        it('modifying the merged object should affect any of the merging ones',
           function() {

               checkClone(complex_simple, obj_complex, obj_simple);
           });
    });

    describe('#merge() SIMPLE in obj with NULL', function() {

        var null_simple = JSUS.merge(obj_with_null, obj_simple);

        // Merge null in simple
        it('should merge the second in the first object', function() {
            null_simple.should.eql(obj_simple);
        });

        it('modifying the merged object should affect any of the merging ones',
           function() {

               checkClone(null_simple, obj_with_null, obj_simple);
           });

    });

    describe('#merge() SIMPLE in obj with FALSY values ', function() {

        var falsy_simple = JSUS.merge(obj_falsy, obj_simple);

        // Merge null in simple
        it('should merge the second in the first object', function() {
            falsy_simple.should.eql(obj_simple);
        });

        it('modifying the merged object should affect any of the merging ones',
           function() {

               checkClone(falsy_simple, obj_falsy, obj_simple);
           });

    });

    // Merging mixed objects
    ///////////////////////////////////////////////////////

    describe('#merge() COMPLEX obj in obj with NULL', function() {

        var null_complex = JSUS.merge(obj_with_null, obj_complex);

        // Merge complex in simple
        it('should merge the second in the first object', function() {
            null_complex.should.eql(obj_complex);
        });

        it('modifying the merged object should affect any of the merging ones',
           function() {

               checkClone(null_complex, obj_with_null, obj_complex);
           });
    });

    describe('#merge() COMPLEX obj in obj with FALSY values', function() {

        var falsy_complex = JSUS.merge(obj_falsy, obj_complex);

        // Merge complex in simple
        it('should merge the second in the first object', function() {
            falsy_complex.should.eql(obj_complex);
        });

        it('modifying the merged object should affect any of the merging ones',
           function() {

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

        it('should merge the second in the first object in the key value',
           function() {

               o.f.should.exist;
               o.c.value.should.exist;
               o.a.value.should.be.eql(merge_out.a);
               o.b.value.should.be.eql(merge_out.b);
               o.c.value.should.be.eql(merge_out.c);
               o.d.value.should.be.eql(merge_out.d);
               o.e.value.should.be.eql(merge_out.e);
               o.f.value.should.be.eql(merge_out.f);
           });

        it('should not overwrite other properties', function() {
            o.a.max.should.exist;
            o.a.min.should.exist;
            o.a.max.should.be.eql(merge_in.a.max);
        });

        it('modifying the merged object should affect any of the merging ones',
           function() {

               checkClone(o, merge_in, merge_out);
           });
    });

    describe('#keys()', function() {

        it('should return all the first level keys', function() {
            JSUS.keys(obj_complex).should.be.eql(['a','b','c']);
        });

        it('should return all no  keys with negative number',
           function() {
               JSUS.keys(obj_complex, -1).should.be.eql([]);
           });

        it('should return all the first level keys with 0',
           function() {
               JSUS.keys(obj_complex, 0).should.be.eql(['a','b','c']);
           });
        
        it('should return all first and second level keys ("level option")',
           function() {
               JSUS.keys(obj_complex, 1)
                   .should.be.eql([ 'a', 'b', 'a', 'b', 'c', 'c' ]);
           });

        it('should return all first and second level keys ("level option")',
           function() {
               JSUS.keys(obj, 2)
                   .should.be.eql([ 'a1', 'a2', 'a3', 'b3' ]);
           });
        
        it('should return up to level 3 keys ("level option")',
           function() {
               JSUS.keys(obj, 3)
                   .should.be.eql([ 'a1', 'a2', 'a3', 'b3', 'b4' ]);
           });
        
        it('should return up to level 4 keys ("level option")',
           function() {
               JSUS.keys(obj, 4)
                   .should.be.eql([ 'a1', 'a2', 'a3', 'b3', 'b4', 'b5' ]);
           });

        it('should return up to level 5 keys (equal to 4) ("level option")',
           function() {
               JSUS.keys(obj, 5)
                   .should.be.eql([ 'a1', 'a2', 'a3', 'b3', 'b4', 'b5' ]);
           });

        // All Option.

        it('should return all the first level keys', function() {
            JSUS.keys(obj_complex, undefined, {
                type: 'all'
            }).should.be.eql(['a','b','c']);
        });

        it('should return all no  keys with negative number',
           function() {
               JSUS.keys(obj_complex, -1, {
                   type: 'all'
               }).should.be.eql([]);
           });

        it('should return all the first level keys with 0',
           function() {
               JSUS.keys(obj_complex, 0, {
                   type: 'all'
               }).should.be.eql(['a','b','c']);
           });
        
        it('should return all first and second level keys ("level option")',
           function() {
               JSUS.keys(obj_complex, 1, {
                   type: 'all'
               }).should.be.eql([ 'a', 'b', 'a', 'b', 'c', 'c' ]);
           });

        it('should return all first and second level keys ("level option")',
           function() {
               JSUS.keys(obj, 2, {
                   type: 'all'
               }).should.be.eql([ 'a1', 'a2', 'a3', 'b3' ]);
           });
        
        it('should return up to level 3 keys ("level option")',
           function() {
               JSUS.keys(obj, 3, {
                   type: 'all'
               }).should.be.eql([ 'a1', 'a2', 'a3', 'b3', 'b4' ]);
           });
        
        it('should return up to level 4 keys ("level option")',
           function() {
               JSUS.keys(obj, 4, {
                   type: 'all'
               }).should.be.eql([ 'a1', 'a2', 'a3', 'b3', 'b4', 'b5' ]);
           });

        it('should return up to level 5 keys (equal to 4) ("level option")',
           function() {
               JSUS.keys(obj, 5, {
                   type: 'all'
               }).should.be.eql([ 'a1', 'a2', 'a3', 'b3', 'b4', 'b5' ]);
           });
        
        // Level Option.
        
        it('should return level 0 keys only (type="level" option)',
           function() {
               JSUS.keys(obj, 0, { type: 'level' })
                   .should.be.eql([ 'a1' ]);
           });
        
        it('should return level 1 keys only (type="level" option)',
           function() {
               JSUS.keys(obj, 1, { type: 'level' })
                   .should.be.eql([ 'a2' ]);
           });
        
        it('should return level 2 keys only (type="level" option)',
           function() {
               JSUS.keys(obj, 2, { type: 'level' })
                   .should.be.eql([ 'a3', 'b3' ]);
           });
        
        it('should return level 3 keys only (type="level" option)',
           function() {
               JSUS.keys(obj, 3, { type: 'level' })
                   .should.be.eql([ 'b4' ]);
           });

        
        it('should return level 4 keys only (type="level" option)',
           function() {
               JSUS.keys(obj, 4, { type: 'level' })
                   .should.be.eql([ 'b5' ]);
           });
        
        it('should return level 5 keys only (no keys) (type="level" option)',
           function() {
               JSUS.keys(obj, 5, { type: 'level' })
                   .should.be.eql([]);
           });

        // Leaf Option.
        
        it('should return level 4 leaf-keys (type="level" option)',
           function() {
               JSUS.keys(obj, 4, { type: 'leaf' })
                   .should.be.eql([  'a3', 'b5' ]);
           });
        
        it('should return level 3 leaf-keys (type="level" option)',
           function() {
               JSUS.keys(obj, 3, { type: 'leaf' })
                   .should.be.eql([  'a3', 'b4' ]);
           });

        it('should return level 2 keys only (type="leaf" option)',
           function() {
               JSUS.keys(obj, 2, { type: 'level' })
                   .should.be.eql([ 'a3', 'b3' ]);
           });
        
        it('should return level 1 keys only (type="leaf" option)',
           function() {
               JSUS.keys(obj, 1, { type: 'level' })
                   .should.be.eql([ 'a2' ]);
           });
        
        it('should return level 0 keys only (type="leaf" option)',
           function() {
               JSUS.keys(obj, 0, { type: 'level' })
                   .should.be.eql([ 'a1' ]);
           });
        
        it('should return level -1 keys only (type="leaf" option)',
           function() {
               JSUS.keys(obj, -1, { type: 'level' })
                   .should.be.eql([]);
           });

        // Concat Leaf Option.
        
        it('should return level 4 leaf-keys (concat option)',
           function() {
               JSUS.keys(obj, 4, { type: 'leaf', concat: true })
                   .should.be.eql([  'a1.a2.a3', 'a1.a2.b3.b4.b5' ]);
           });


        // Concat Leaf Option + separator.
        
        it('should return level 4 leaf-keys (concat+separator option)',
           function() {
               JSUS.keys(obj, 4, {
                   type: 'leaf',
                   concat: true,
                   separator: '-'
               }).should.be.eql([ 'a1-a2-a3', 'a1-a2-b3-b4-b5' ]);
           });
        
        // Concat All Option.
        
        it('should return  all keys up to level 4 (concat option)',
           function() {
               JSUS.keys(obj, 4, { concat: true })
                   .should.be.eql([                       
                       'a1',
                       'a1.a2',
                       'a1.a2.a3',
                       'a1.a2.b3',
                       'a1.a2.b3.b4',
                       'a1.a2.b3.b4.b5'
                   ]);
           });


        // Concat All Option + separator.
        
        it('should return all keys up to level 4  (concat+separator option)',
           function() {
               JSUS.keys(obj, 4, {
                   concat: true,
                   separator: '-'
               }).should.be.eql([                       
                   'a1',
                   'a1-a2',
                   'a1-a2-a3',
                   'a1-a2-b3',
                   'a1-a2-b3-b4',
                   'a1-a2-b3-b4-b5'
               ]);
           });

        // Distinct Option.
        
        it('should return all keys up to level 4  (distinct option)',
           function() {
               var obj2;
               obj2 = {
                   a1: { a2: { a3: "a", a2: { b4: { a3: "b" }  } } }
               };
               JSUS.keys(obj2, 4, {
                   distinct: true
               }).should.be.eql([
                   'a1', 'a2', 'a3', 'b4'
               ]);
           });
        
        
        it('should return all keys up to level 4  (with duplicates)',
           function() {
               var obj2;
               obj2 = {
                   a1: { a2: { a3: "a", a2: { b4: { a3: "b" }  } } }
               };
               JSUS.keys(obj2, 4).should.be.eql([
                   'a1', 'a2', 'a3', 'a2', 'b4', 'a3'
               ]);
           });
        
        // Cb Option.
        
        it('should return all keys up to level 4  (distinct option)',
           function() {
               var obj2;
               obj2 = {
                   a1: { a2: { a3: "a", a2: { b4: { a3: "b" }  } } }
               };
               JSUS.keys(obj2, 4, {
                   distinct: true,
                   cb: function(key) { return '_' + key; }
               }).should.be.eql([
                   '_a1', '_a2', '_a3', '_b4'
               ]);
           });
        
        
        it('should return all keys up to level 4  (with duplicates)',
           function() {
               var obj2;
               obj2 = {
                   a1: { a2: { a3: "a", a2: { b4: { a3: "b" }  } } }
               };
               JSUS.keys(obj2, 4, {
                   cb: function(key) { return '_' + key; }
               }).should.be.eql([
                   '_a1', '_a2', '_a3', '_a2', '_b4', '_a3'
               ]);
           });
        
        // Array Option.
        
        it('should return all keys up to level 4  (concat+sep+array option)',
           function() {
               var myarr = [ 1, 2 ];
               JSUS.keys(obj, 4, {
                   concat: true,
                   separator: '-',
                   array: myarr
               });

               myarr.should.be.eql([
                   1, 2,
                   'a1',
                   'a1-a2',
                   'a1-a2-a3',
                   'a1-a2-b3',
                   'a1-a2-b3-b4',
                   'a1-a2-b3-b4-b5'
               ]);
           });
        
        // Array Option.
        
        it('should return all keys up to level 4  (concat+sep+array option)',
           function() {
               var myarr = [ 1, 2 ];
               JSUS.keys(obj, 4, {
                   concat: true,
                   separator: '-',
                   array: myarr,
                   curParent: 'parent'
               });

               myarr.should.be.eql([
                   1, 2,
                   'parent-a1',
                   'parent-a1-a2',
                   'parent-a1-a2-a3',
                   'parent-a1-a2-b3',
                   'parent-a1-a2-b3-b4',
                   'parent-a1-a2-b3-b4-b5'
               ]);
           });

        // Shortcut syntax.

        
        it('should return all keys up to level 4  (shortcut syntax)',
           function() {
               var myarr = [ 1, 2 ];
               JSUS.keys(obj, {
                   level: 4,
                   concat: true,
                   separator: '-',
                   array: myarr,
                   curParent: 'parent'
               });

               myarr.should.be.eql([
                   1, 2,
                   'parent-a1',
                   'parent-a1-a2',
                   'parent-a1-a2-a3',
                   'parent-a1-a2-b3',
                   'parent-a1-a2-b3-b4',
                   'parent-a1-a2-b3-b4-b5'
               ]);
           });
        
        it('should return all keys up to level 4  (shortcut syntax)',
           function() {
               var myarr = [ 1, 2 ];
               JSUS.keys(obj, {
                   concat: true,
                   separator: '-',
                   array: myarr,
                   curParent: 'parent'
               });

               myarr.should.be.eql([
                   1, 2,
                   'parent-a1'
               ]);
           });
        
        
    });



    
    describe('#equals()', function() {

        it('should say that 1 and 1 are equal', function() {
            JSUS.equals(1, 1).should.be.true;
        });

        it('should say that 1 and \'1\' are NOT equal', function() {
            JSUS.equals(1, '1').should.be.false;
            JSUS.equals('1', 1).should.be.false;
        });

        it('should say that "a" and "a" are equal', function() {
            JSUS.equals('a', 'a').should.be.true;
            JSUS.equals("a", "a").should.be.true;
        });

        it('should say that "a" and "b" are NOT equal', function() {
            JSUS.equals('a', 'b').should.be.false;
            JSUS.equals('b', 'a').should.be.false;
            JSUS.equals("a", "b").should.be.false;
            JSUS.equals("b", "a").should.be.false;
        });

        it('should say that "blah blah!" and "blah blah!" are equal',
           function() {

               JSUS.equals('blah blah!', 'blah blah!').should.be.true;
               JSUS.equals("blah blah!", "blah blah!").should.be.true;
           });

        it('should say that undefined and undefined are equal', function() {
            JSUS.equals(undefined, undefined).should.be.true;
        });

        it('should say that null and null are equal', function() {
            JSUS.equals(null, null).should.be.true;
        });

        it('should say that false and false are equal', function() {
            JSUS.equals(false, false).should.be.true;
        });

        it('should say that true and true are equal', function() {
            JSUS.equals(true, true).should.be.true;
        });

        it('should say that false and true are NOT equal', function() {
            JSUS.equals(false, true).should.be.false;
        });

        it('should say that 0 and 0 are equal', function() {
            JSUS.equals(0, 0).should.be.true;
        });

        it('should say that NaN and NaN are equal', function() {
            JSUS.equals(NaN, NaN).should.be.true;
        });

        it('should say that Infinity and Infinity are equal', function() {
            JSUS.equals(Infinity, Infinity).should.be.true;
        });

        it('should say that two simple objects are equal', function() {
            JSUS.equals(obj_simple, obj_simple).should.be.true;
        });

        it('should say that two complex objects are equal', function() {
            JSUS.equals(obj_complex, obj_complex).should.be.true;
        });

        it('should say that two falsy objects are equal', function() {
            JSUS.equals(obj_falsy, obj_falsy).should.be.true;
        });

        it('should say that two objects with nulls are equal', function() {
            JSUS.equals(obj_with_null, obj_with_null).should.be.true;
        });

        it('should say that two functions are equal', function() {
            JSUS.equals(f, fcopy).should.be.true;
        });

        it('should say that two functions are NOT equal', function() {
            JSUS.equals(f, f2).should.be.false;
        });
    });

    describe('#hasOwnNestedProperty()', function() {

        it('should return TRUE for complex_obj', function() {
            JSUS.hasOwnNestedProperty('b.a', obj_complex).should.be.true;
        });

        it('should return FALSE for simple_obj', function() {
            JSUS.hasOwnNestedProperty('b.a', obj_simple).should.be.false;
        });
    });


    describe('#join()', function() {

        var a = {b:2, c:3, f:5};
        var b = {a:10, b:2, c:100, d:4};

        it('should return TRUE for complex_obj', function() {
            JSUS.join(a,b).should.be.eql({b:2, c:100, f:5})
        });
    });

    describe('#implode()', function() {
        it('should return TRUE for complex_obj', function() {
            JSUS.implode(obj_complex).should.be.eql([
                {a:1}, {b: obj_simple}, {c:3}
            ]);
        });
    });

    describe('#deleteNestedKey()', function() {
        var copy_complex;
        beforeEach(function() {
            copy_complex = JSUS.clone(obj_complex);
        })
        it('should return TRUE for complex_obj', function() {
            JSUS.deleteNestedKey('b.c', copy_complex).should.be.true;
        });
        it('should delete nested property from complex object', function() {
            JSUS.deleteNestedKey('b.c', copy_complex);
            copy_complex.should.be.eql({a:1, b:{a:1, b:2}, c:3});
        });
        it('should delete first-level property from complex object',
           function() {

               JSUS.deleteNestedKey('b', copy_complex);
               copy_complex.should.be.eql({a:1, c:3});
           });
        it('should return FALSE when nested property does not exist',
           function() {

               JSUS.deleteNestedKey('b.c.a.g', copy_complex).should.be.false;
           });
    });

    describe('#setNestedValue()', function() {
        var copy_complex;
        beforeEach(function() {
            copy_complex = JSUS.clone(obj_complex);
        })
        it('should set nested property from complex object', function() {
            JSUS.setNestedValue('b.c', 'foo', copy_complex);
            copy_complex.should.be.eql({a:1, b:{a:1, b:2, c: 'foo'}, c:3});
        });
        it('should set first-level property from complex object', function() {
            JSUS.setNestedValue('b', 'foo', copy_complex);
            copy_complex.should.be.eql({a:1, b: 'foo', c:3});
        });
        it('should create new property when nested property does not exist #1',
           function() {

               JSUS.setNestedValue('b.c.a', 'foo', copy_complex);
               copy_complex.should.be.eql(
                   {a:1, b:{a:1, b:2, c: {a: 'foo'}}, c:3}
               );
           });
        it('should create new property when nested property does not exist #2',
           function() {

               JSUS.setNestedValue('b.c.a.g', 'foo', copy_complex);
               copy_complex.should.be.eql(
                   {a:1, b:{a:1, b:2, c: {a: {g: 'foo'}}}, c:3}
               );
           });
        it('should create a new object when none is passed', function() {
            JSUS.setNestedValue('b.c.a.g', 'foo')
                .should.be.eql({b:{c: {a: {g: 'foo'}}}});
        });
    });

    describe('#getNestedValue()', function() {
        var copy_complex;
        beforeEach(function() {
            copy_complex = JSUS.clone(obj_complex);
        })
        it('should get nested property from complex object', function() {
            JSUS.getNestedValue('b.c', copy_complex).should.be.eql(3);
        });
        it('should get first-level property from complex object', function() {
            JSUS.getNestedValue('b', copy_complex).should.be.eql({
                a:1, b: 2, c:3
            });
        });
        it('should return undefined when a nested property does not exist',
           function() {

               (JSUS.getNestedValue('b.c.a', copy_complex) === undefined)
                   .should.be.true;
               (JSUS.getNestedValue('b.c.a.g.h', copy_complex) === undefined)
                   .should.be.true;
           });
    });

    describe('#subboj()', function() {
        it('should return subset of first-level properties of complex object',
           function() {

               JSUS.subobj(obj_complex, ['a','b']).should.be.eql({
                   a:1, b: { a:1, b:2, c: 3 }
               });
           });
        it('should return subset of nested properties of complex object',
           function() {

               JSUS.subobj(obj_complex,['b.c']).should.be.eql({b: {c: 3}});
           });
        it('should return an empty object when no selected property exists',
           function() {

               JSUS.subobj(obj_complex, ['b.c.a']).should.be.eql({});
               JSUS.subobj(obj_complex, ['aa']).should.be.eql({})
           });
    });

    describe('#skim()', function() {
        it('should remove first-level properties from a complex object',
           function() {

               JSUS.skim(obj_complex, ['a','b']).should.be.eql({c: 3});
           });
        it('should remove nested properties from a complex object',
           function() {

               JSUS.skim(obj_complex,['b.c','c'])
                   .should.be.eql({a:1, b:{a:1, b:2}});
           });
        it('should return copy of object when no selected property exists',
           function() {

               JSUS.skim(obj_complex, ['b.c.a']).should.be.eql(obj_complex);
               JSUS.skim(obj_complex, ['aa']).should.be.eql(obj_complex)
           });
    });

    describe('#mixin() complex object in simple', function() {
        var obj_simple = {
            a: 1,
            b: 2,
            c: 3,
        };

        // If update, update also getAllKeys test
        var obj_complex = {
            a: 1,
            b: {a: 1, b: 2},
            c: 3,
        };

        JSUS.mixin(obj_simple, obj_complex);

        // Merge complex in simple
        it('should merge the second in the first object', function() {
            obj_complex.should.eql(obj_simple);
        });

        it('modifying the properties of one object should affect the other one',
           function() {

               obj_simple.b.a = 'foo';
               obj_simple.should.eql(obj_complex);
           });

    });

    describe('#mixout() complex object in simple', function() {
        var obj_simple = {
            a: 1,
            b: 2,
            c: 3,
        };

        // If update, update also getAllKeys test
        var obj_complex = {
            a: 1,
            b: {a: 1, b: 2},
            c: 3,
            d: 'foo',
        };

        JSUS.mixout(obj_complex, obj_simple);

        // Merge complex in simple
        it('should not merge overlapping keys of second into first object',
           function() {

               obj_complex.should.not.eql(obj_simple);
               obj_complex.b.should.eql({a: 1, b: 2});
           });

        JSUS.mixout(obj_simple, obj_complex);

        // Merge complex in simple
        it('should merge non-overlapping keys of second into first object',
           function() {

               obj_simple.d.should.eql(obj_complex.d);
           });

    });

    describe('#mixcommon() complex object in simple', function() {
        var obj_simple = {
            a: 1,
            b: 2,
            c: 3,
        };

        // If update, update also getAllKeys test
        var obj_complex = {
            a: 1,
            b: {a: 1, b: 2},
            c: 3,
            d: 'foo',
        };

        JSUS.mixcommon(obj_simple, obj_complex);

        // Merge complex in simple
        it('should merge overlapping keys of second into first object',
           function() {

               obj_complex.should.not.eql(obj_simple);
               obj_simple.b.should.eql(obj_complex.b);
           });

    });

    describe('#melt()', function() {
        it('should merge properties and values together, recycling the values',
           function() {

               var o = JSUS.melt(['a','b','c'], [1,2]);
               o.should.eql({ a: 1, b: 2, c: 1 });
           });
        it('should merge properties and values together, ignoring extra values',
           function() {

               var o = JSUS.melt(['a','b','c'], [1,2,3,4]);
               o.should.eql({ a: 1, b: 2, c: 3 });
           });

    });

    describe('#uniqueKey()', function() {
        it('should find a random unique key for the obj', function() {
            var key = JSUS.uniqueKey({ a: 1, b: 2, c: 1 });
            key.should.not.eql('a');
            key.should.not.eql('b');
            key.should.not.eql('c');
            (key === undefined).should.be.false;

        });
        it('should accept the proposed key for the obj', function() {
            var key = JSUS.uniqueKey({ a: 1, b: 2, c: 1 }, 'f');
            key.should.eql('f');
        });
        it('should increment by 1 the proposed key for the obj', function() {
            var key = JSUS.uniqueKey({ a: 1, b: 2, c: 1 }, 'c');
            key.should.eql('c1');
        });
        it('should return undefined if the limit of tries has been reached',
           function() {

               var key = JSUS.uniqueKey({ a: 1, a1: 2, a2: 1 }, 'a', 2);
               (key === undefined).should.be.true;
           });
    });

    describe('#augment()', function() {
        it('should augment the properties of obj1 with obj2', function() {
            var a = { a:1, b:2, c:3 };
            var b = { a:10, b:2, c:100, d:4 };
            JSUS.augment(a, b);
            a.should.eql({ a: [1, 10], b: [2, 2], c: [3, 100]});
        });
        it('should augment properties of obj1 with obj2 on specified keys only',
           function() {

               var a = { a:1, b:2, c:3 };
               var b = { a:10, b:2, c:100, d:4 };
               JSUS.augment(a, b, ['b', 'c', 'd']);
               a.should.eql({ a: 1, b: [2, 2], c: [3, 100], d: [4]});
           });
    });

    describe('#split()', function() {
        it('should split an object along the dimension (level 1)', function() {
            var a = { a:1, b:2, c: { a:10, b:2, c:100, d: { f: 1, g: 2 } } };
            var res = JSUS.split(a, 'c');
            res.should.eql([
                { a: 1, b: 2, c: { a: 10 } },
                { a: 1, b: 2, c: { b: 2 } },
                { a: 1, b: 2, c: { c: 100 } },
                { a: 1, b: 2, c: { d: { f: 1, g: 2 } } }
            ]);
        });

        it('should split an object along the dimension (level 1)', function() {
            var a = { a:1, b:2, c: { a:10, b:2, c: { b: { f: 1, g: 2 } } } };
            var res = JSUS.split(a, 'c');
            res.should.eql([
                { a: 1, b: 2, c: { a: 10 } },
                { a: 1, b: 2, c: { b: 2 } },
                { a: 1, b: 2, c: { c: { b: { f: 1, g: 2 } } } }
            ]);
        });

        it('should split an object along the dimension (level 2)', function() {
            var a = {
                a:1,
                b:2,
                c: {
                    a:10,
                    b:2,
                    c: {
                        b: {
                            f: 1,
                            g: 2
                        },
                        p: 1
                    }
                }
            };

            var res = JSUS.split(a, 'c', 2);
            res.should.eql([
                { a: 1, b: 2, c: { a: 10 } },
                { a: 1, b: 2, c: { b: 2 } },
                { a: 1, b: 2, c: { c: { b: { f: 1, g: 2 } } } },
                { a: 1, b: 2, c: { c: { p: 1 } } }
            ]);
        });

        it('should split an object along the dimension (level 3)', function() {
            var a = {
                a:1,
                b:2,
                c: {
                    a:10,
                    b:2,
                    c: {
                        b: {
                            f: 1,
                            g: 2
                        },
                        p: 1
                    }
                }
            };

            var res = JSUS.split(a, 'c', 3);
            res.should.eql([
                { a: 1, b: 2, c: { a: 10 } },
                { a: 1, b: 2, c: { b: 2 } },
                { a: 1, b: 2, c: { c: { b: { f: 1 } } } },
                { a: 1, b: 2, c: { c: { b: { g: 2 } } } },
                { a: 1, b: 2, c: { c: { p: 1 } } }
            ]);
        });

        it('should split an object along the dimension (level 1 array keys!)',
           function() {

               var a = { a:1, b:2, c: [ 10, 2, 100, { f: 1, g: 2 } ] };
               var res = JSUS.split(a, 'c', undefined, true);
               res.should.eql([
                   { a: 1, b: 2, c: { '0': 10  } },
                   { a: 1, b: 2, c: { '1': 2  } },
                   { a: 1, b: 2, c: { '2': 100 } },
                   { a: 1, b: 2, c: { '3': { f: 1, g: 2 } } }
               ]);
        });


        it('should split an object along the dimension (level 2 array keys!)',
           function() {

               var a = { a:1, b:2, c: [ 10, 2, 100, { f: 1, g: 2 } ] };
               var res = JSUS.split(a, 'c', 2, true);
               res.should.eql([
                   { a: 1, b: 2, c: { '0': 10  } },
                   { a: 1, b: 2, c: { '1': 2  } },
                   { a: 1, b: 2, c: { '2': 100 } },
                   { a: 1, b: 2, c: { '3': { f: 1 } } },
                   { a: 1, b: 2, c: { '3': { g: 2 } } }
               ]);
        });


        it('should split an object along the dimension (level 3 array keys!)',
           function() {
               var a = {
                   a:1,
                   b:2,
                   c: [
                       10,
                       2,
                       {
                           b: {
                               f: 1,
                               g: 2
                           },
                           p: 1
                       },
                       'a'
                   ]
               };
               var res = JSUS.split(a, 'c', 3, true);
               res.should.eql([
                   { a: 1, b: 2, c: { '0': 10 } },
                   { a: 1, b: 2, c: { '1': 2 } },
                   { a: 1, b: 2, c: { '2': { b: { f: 1 } } } },
                   { a: 1, b: 2, c: { '2': { b: { g: 2 } } } },
                   { a: 1, b: 2, c: { '2': { p: 1 } } },
                   { a: 1, b: 2, c: { '3': 'a' } }
               ]);
           });

        it('should split an object along the dimension (level 1 array nokeys)',
           function() {

               var a = { a:1, b:2, c: [ 10, 2, 100, { f: 1, g: 2 } ] };
               var res = JSUS.split(a, 'c');
               res.should.eql([
                   { a: 1, b: 2, c: 10  },
                   { a: 1, b: 2, c: 2  },
                   { a: 1, b: 2, c: 100 },
                   { a: 1, b: 2, c: { f: 1, g: 2 } }
               ]);
        });


        it('should split an object along the dimension (level 2 array nokeys)',
           function() {

               var a = { a:1, b:2, c: [ 10, 2, 100, { f: 1, g: 2 } ] };
               var res = JSUS.split(a, 'c', 2);
               res.should.eql([
                   { a: 1, b: 2, c: 10  },
                   { a: 1, b: 2, c: 2  },
                   { a: 1, b: 2, c: 100 },
                   { a: 1, b: 2, c: { f: 1 } },
                   { a: 1, b: 2, c: { g: 2 } }
               ]);
        });


        it('should split an object along the dimension (level 3 array nokeys)',
           function() {
               var a = {
                   a:1,
                   b:2,
                   c: [
                       10,
                       2,
                       {
                           b: {
                               f: 1,
                               g: 2
                           },
                           p: 1
                       }
                   ]
               };

               var res = JSUS.split(a, 'c', 3);
               res.should.eql([
                   { a: 1, b: 2, c: 10 },
                   { a: 1, b: 2, c: 2 },
                   { a: 1, b: 2, c: { b: { f: 1 } } },
                   { a: 1, b: 2, c: { b: { g: 2 } } },
                   { a: 1, b: 2, c: { p: 1 } }
               ]);
           });


    });

    describe('#obj2Array()', function() {
        it('should unfold an object completely', function() {
            var o = { a:1, b:2, c:3 };
            var a = JSUS.obj2Array(o);
            a.should.eql([1,2,3]);
        });
        it('should unfold an object only until the limit', function() {
            var o = { a:1, b:2, c:{ d: 1} };
            var a = JSUS.obj2Array(o,1);
            a.should.eql([1,2,{d:1}]);
        });
    });

    describe('#obj2KeyedArray()', function() {
        it('should unfold an object completely', function() {
            var o = { a:1, b:2, c:3 };
            var a = JSUS.obj2KeyedArray(o);
            a.should.eql(['a', 1, 'b', 2, 'c', 3]);
        });
        it('should unfold an object only until the limit', function() {
            var o = { a:1, b:2, c:{ d: 1} };
            var a = JSUS.obj2KeyedArray(o,1);
            a.should.eql(['a', 1, 'b', 2, 'c', {d: 1}]);
        });
    });

    describe('#pairwiseWalk()', function() {
        it('should perform the sum of two object', function() {
            var o1 = { a:1, b:2, c:3, d1: 4};
            var o2 = { a:1, b:2, c:3, d2: 5 };

            var sum = function(a,b) {
                if ('undefined' !== typeof a) {
                    return 'undefined' !== typeof b ? a + b : a;
                }
                return b;
            };

            var a = JSUS.pairwiseWalk(o1, o2, sum);
            a.should.eql( { a:2, b:4, c:6, d1:4, d2:5});
        });
    });

    describe('#getKeyByValue()', function() {
        it('should return the key with value 1', function() {
            var a = JSUS.getKeyByValue(objkeys, 1);
            (a === 'a' || a === 'e').should.be.true;
        });
        it('should return an array of all keys with value 1', function() {
            var a = JSUS.getKeyByValue(objkeys, 1, true);
            JSUS.isArray(a).should.be.true;
            (a[0] === 'a' || a[1] === 'a').should.be.true;
            (a[0] === 'e' || a[1] === 'e').should.be.true;
        });
    });
});
