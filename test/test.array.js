var util = require('util');
should = require('should'),
J = require('./../jsus').JSUS;

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

describe('ARRAY: ', function(){

    // removeElement
    describe('#removeElement()', function(){
        var testArray = ['element1', 'element2', 'element3', 'element4'];

        it('should return element3 when removing it from the array', function(){
            J.removeElement('element3', testArray).should.eql(['element3']);
        });
        it('should return false when removing element5 from array', function(){
            J.removeElement('element5', testArray).should.equal(false);
        });
    });

    // inArray
    describe('#inArray()', function(){
        var testArray = ['element1', 'element2', 'element3', 'element4'];

        it('should return TRUE when looking for element2', function() {
            J.inArray('element2', testArray).should.be.true;
        });
        it('should return FALSE when looking for element5', function() {
            J.inArray('element5', testArray).should.be.false;
        });

    });

    // indexOf strings
    describe('#indexOf()', function(){
        var testArray = [
            'element1', 'element2', 'element3', 'element4',
            'element1', 'element2', 'element3', 'element4',
            'element1', 'element2', 'element3', 'element4'
        ];

        // First default.
        it('should return 1 for element2 (first default)', function() {
            J.indexOf('element2', testArray).should.be.eql(1);
        });
        it('should return 2 for element3 (first default)', function() {
            J.indexOf('element3', testArray).should.be.eql(2);
        });
        it('should return -1 when for element5 (first default)', function() {
            J.indexOf('element5', testArray).should.be.eql(-1);
        });

        // First.
        it('should return 1 for element2 (first)', function() {
            J.indexOf('element2', testArray, 'first').should.be.eql(1);
        });

        it('should return 2 for element3 (first)', function() {
            J.indexOf('element3', testArray, 'first').should.be.eql(2);
        });
        it('should return -1 when for element5 (first)', function() {
            J.indexOf('element5', testArray, 'first').should.be.eql(-1);
        });

        // Last.
        it('should return 9 for element2 (last)', function() {
            J.indexOf('element2', testArray, 'last').should.be.eql(9);
        });

        it('should return 10 for element3 (last)', function() {
            J.indexOf('element3', testArray, 'last').should.be.eql(10);
        });
        it('should return -1 when for element5 (last)', function() {
            J.indexOf('element5', testArray, 'last').should.be.eql(-1);
        });

        // All.
        it('should return [1,5,9] for element2 (all)', function() {
            J.indexOf('element2', testArray, 'all').should.be.eql([1,5,9]);
        });

        it('should return [2,6,10] for element3 (all)', function() {
            J.indexOf('element3', testArray, 'all').should.be.eql([2,6,10]);
        });
        it('should return [] when for element5 (all)', function() {
            J.indexOf('element5', testArray, 'all').should.be.eql([]);
        });

        // All (expected N = 3).
        it('should return [1,5,9] for element2 (all N=3)', function() {
            J.indexOf('element2', testArray, 'all', 3).should.be.eql([1,5,9]);
        });

        it('should return [2,6,10] for element3 (all N=3)', function() {
            J.indexOf('element3', testArray, 'all', 3).should.be.eql([2,6,10]);
        });
        it('should return [] when for element5 (all N=3)', function() {
            J.indexOf('element5', testArray, 'all', 3).should.be.eql([]);
        });

    });

    // indexOf numbers
    describe('#indexOf()', function(){
        var testArray = [
            1, 2, 3, 4,
            1, 2, 3, 4,
            1, 2, 3, 4
        ];

        // First default.
        it('should return 1 for number 2 (first default)', function() {
            J.indexOf(2, testArray).should.be.eql(1);
        });
        it('should return 2 for number 3 (first default)', function() {
            J.indexOf(3, testArray).should.be.eql(2);
        });
        it('should return -1 when for number 5 (first default)', function() {
            J.indexOf(5, testArray).should.be.eql(-1);
        });

        // First.
        it('should return 1 for number 2 (first)', function() {
            J.indexOf(2, testArray, 'first').should.be.eql(1);
        });

        it('should return 2 for number 3 (first)', function() {
            J.indexOf(3, testArray, 'first').should.be.eql(2);
        });
        it('should return -1 when for number 5 (first)', function() {
            J.indexOf(5, testArray, 'first').should.be.eql(-1);
        });

        // Last.
        it('should return 9 for number 2 (last)', function() {
            J.indexOf(2, testArray, 'last').should.be.eql(9);
        });

        it('should return 10 for number 3 (last)', function() {
            J.indexOf(3, testArray, 'last').should.be.eql(10);
        });
        it('should return -1 when for number 5 (last)', function() {
            J.indexOf(5, testArray, 'last').should.be.eql(-1);
        });

        // All.
        it('should return [1,5,9] for number 2 (all)', function() {
            J.indexOf(2, testArray, 'all').should.be.eql([1,5,9]);
        });

        it('should return [2,6,10] for number 3 (all)', function() {
            J.indexOf(3, testArray, 'all').should.be.eql([2,6,10]);
        });
        it('should return [] when for number 5 (all)', function() {
            J.indexOf(5, testArray, 'all').should.be.eql([]);
        });

        // All (expected N = 3).
        it('should return [1,5,9] for number 2 (all N=3)', function() {
            J.indexOf(2, testArray, 'all', 3).should.be.eql([1,5,9]);
        });

        it('should return [2,6,10] for number 3 (all N=3)', function() {
            J.indexOf(3, testArray, 'all', 3).should.be.eql([2,6,10]);
        });
        it('should return [] when for number 5 (all N=3)', function() {
            J.indexOf(5, testArray, 'all', 3).should.be.eql([]);
        });

    });

    // indexOf objects
    describe('#indexOf()', function(){
        var testArray = [
            {}, {a: 1}, {b: 2, c: 3}, {d: 4},
            {}, {a: 1}, {b: 2, c: 3}, {d: 4},
            {}, {a: 1}, {b: 2, c: 3}, {d: 4}
        ];

        // First default.
        it('should return 1 for {a: 1} (first default)', function() {
            J.indexOf({a: 1}, testArray).should.be.eql(1);
        });
        it('should return 2 for {b: 2, c: 3} (first default)', function() {
            J.indexOf({b: 2, c: 3}, testArray).should.be.eql(2);
        });
        it('should return -1 when for 5 (first default)', function() {
            J.indexOf(5, testArray).should.be.eql(-1);
        });

        // First.
        it('should return 1 for {a: 1} (first)', function() {
            J.indexOf({a: 1}, testArray, 'first').should.be.eql(1);
        });

        it('should return 2 for {b: 2, c: 3} (first)', function() {
            J.indexOf({b: 2, c: 3}, testArray, 'first').should.be.eql(2);
        });
        it('should return -1 when for 5 (first)', function() {
            J.indexOf(5, testArray, 'first').should.be.eql(-1);
        });

        // Last.
        it('should return 9 for {a: 1} (last)', function() {
            J.indexOf({a: 1}, testArray, 'last').should.be.eql(9);
        });

        it('should return 10 for {b: 2, c: 3} (last)', function() {
            J.indexOf({b: 2, c: 3}, testArray, 'last').should.be.eql(10);
        });
        it('should return -1 when for 5 (last)', function() {
            J.indexOf(5, testArray, 'last').should.be.eql(-1);
        });

        // All.
        it('should return [1,5,9] for {a: 1} (all)', function() {
            J.indexOf({a: 1}, testArray, 'all').should.be.eql([1,5,9]);
        });

        it('should return [2,6,10] for {b: 2, c: 3} (all)', function() {
            J.indexOf({b: 2, c: 3}, testArray, 'all').should.be.eql([2,6,10]);
        });
        it('should return [] when for 5 (all)', function() {
            J.indexOf(5, testArray, 'all').should.be.eql([]);
        });

        // All (expected N = 3).
        it('should return [1,5,9] for {a: 1} (all N=3)', function() {
            J.indexOf({a: 1}, testArray, 'all', 3).should.be.eql([1,5,9]);
        });

        it('should return [2,6,10] for {b: 2, c: 3} (all N=3)', function() {
            J.indexOf({b: 2, c: 3}, testArray, 'all', 3)
                .should.be.eql([2,6,10]);
        });
        it('should return [] when for 5 (all N=3)', function() {
            J.indexOf(5, testArray, 'all', 3).should.be.eql([]);
        });

    });

    describe('#latinSquare()', function() {
        var S = J.randomInt(3,10); // start
        var L = J.randomInt(3,S); // limit
        var ls = null

        before(function(){
            ls = J.latinSquare(S,L);
        });

        it('The size of latin square should be correct', function() {
            ls.length.should.equal(L);
        });

        it('The row of latin square should have correct length', function() {
            for (var z = 0; z < L; z++) {
                ls[z].length.should.equal((S));
            }
        });

        it('Symbol "i" should appear once and only once each row', function() {
            for (var i = 0; i < L; i++) {
                var elements = [];
                for (var j = 0; j < S; j++) {
                    for (var z = 0; z < S; z++) {
                        if (z == j) continue;
                        ls[i][j].should.not.be.equal(ls[i][z]);
                    }
                }
            }
        });

        it('Symbol "i" should appear at most once in each column', function() {
            for (var j = 0; j < S; j++) {
                for (var i=0; i < L; i++) {
                    for (var z = 0; z < L; z++) {
                        if (z == j) continue;
                        ls[i][j].should.not.be.equal(ls[i][z]);
                    }
                }
            }
        });
    });



    describe('#latinSquareNoSelf()', function() {
        var S = J.randomInt(3,10); // start
        var L = J.randomInt(3,(S-1)); // limit
        var ls = null

        before(function(){
            ls = J.latinSquareNoSelf(S,L);
        });

        it('Column "j" should not contain "j" as index', function(){
            for (var j = 0; j < S; j++) {
                for (var i=0; i < L; i++) {
                    ls[i][j].should.not.be.equal(j);
                }
            }
        });


    });


    describe('#isArray()', function() {
        var tests = [
            {},
            null,
            false,
            undefined,
            0,
            1,
            'a',
            'ciao',
        ];

        it('should distinguish between array and not array', function() {
            J.isArray([]).should.be.true;
            J.isArray(tests).should.be.true;

            J.each(tests, function(e) {
                J.isArray(e).should.not.be.true;
            });
        });


    });


    describe('#seq()', function() {

        it('should reproduce the sequence 0:5', function() {
            J.seq(0,5).should.be.eql([0,1,2,3,4,5]);
        });

        it('should reproduce the sequence 5:0', function() {
            J.seq(5,0).should.be.eql([5,4,3,2,1,0]);
        });

        it('should reproduce the sequence -5:0', function() {
            J.seq(-5,0).should.be.eql([-5,-4,-3,-2,-1,0]);
        });

        it('should reproduce the sequence 0:-5', function() {
            J.seq(0,-5).should.be.eql([0,-1,-2,-3,-4,-5]);
        });

        it('should reproduce the sequence -2:-2', function() {
            J.seq(-2,2).should.be.eql([-2,-1,0,1,2]);
        });

        it('should reproduce return a single number array when start = end',
           function() {

               J.seq(2,2).should.be.eql([2]);
        });

        it('should reproduce the sequence 0:5 with increment 2', function() {
            J.seq(0,5,2).should.be.eql([0,2,4]);
        });

        it('should reproduce the sequence 5:0 with increment 2', function() {
            J.seq(5,0,2).should.be.eql([5,3,1]);
        });

        it('should return false if parameters are missing or wrong',
           function() {

               J.seq(-2).should.be.false;
               J.seq('a',0).should.be.false;
               J.seq().should.be.false;
               J.seq(null, 0).should.be.false;
               J.seq(undefined, 2).should.be.false;
               J.seq(Infinity, 5).should.be.false;
               J.seq(5,0,0).should.be.false;
        });

        it('should reproduce the sequence 5:0 and execute the callback',
           function() {
               var func = function(e){
                   if (e < 10) {
                       e = '0' + e;
                   }
                   return 'R_' + e;
               };
               J.seq(1,4,1,func)
                   .should.be.eql(['R_01','R_02','R_03','R_04']);

        });

    });


    describe('#map()', function() {
        var func = function(e, i, t, m) {
            if (i) e = e + i;
            if (t) e = e + t;
            if (m) e = e + m;
            if (e > 5) return e;
        };
        var array = J.seq(1,10);


        it('should return [6,7,8,9,10]', function() {
            J.map(array, func).should.eql([6,7,8,9,10]);
        });

        it('should return [6,7,8,9,10,11]', function() {
            J.map(array, func, 1).should.eql([6,7,8,9,10,11]);
        });

        it('should return [6,7,8,9,10,11,12]', function() {
            J.map(array, func, 1, 1).should.eql([6,7,8,9,10,11,12]);
        });

        it('should return [6,7,8,9,10,11,12,13]', function() {
            J.map(array, func, 1, 1, 1).should.eql([6,7,8,9,10,11,12,13]);
        });


    });

    describe('#rep()', function() {

        var array = J.seq(1,5);


        it('should replicate an array twice', function() {
            J.rep(array, 2).should.eql([1,2,3,4,5,1,2,3,4,5]);
        });

        it('should return the same array', function(){
            J.rep(array, 1).should.be.eql(array);
            J.rep(array).should.be.eql(array);
        });

        it('should replicate an array three times', function(){
            J.rep(array, 3).should.eql([1,2,3,4,5,1,2,3,4,5,1,2,3,4,5]);
        });

    });

    describe('#distinct()', function() {

        it('should eliminate duplicated strings', function(){
            var array = ["a", "a", "b", "b", "c"];
            J.distinct(array).should.eql(["a","b","c"]);
        });

        it('should eliminate duplicated numbers', function(){
            var array = [1,2,3,1,2,3,4,5,1,8];
            J.distinct(array).should.eql([1,2,3,4,5,8]);
        });

        it('should eliminate duplicated special values', function(){
            var array = [null,null,{},{},0,0, undefined,Infinity,
                         Infinity, undefined];
            J.distinct(array).should.be.eql([null,{},0,undefined,Infinity]);
        });

        it('should eliminate duplicated special values (NaN)', function(){
            var array = [NaN, NaN];
            var distinct = J.distinct(array);
            distinct.length.should.be.eql(1);
            distinct[0].should.be.NaN;
        });

    });


    describe('#stretch()', function() {

        var array = [1,2,3];


        it('should repeat each element of the array twice', function(){
            J.stretch(array, 2).should.eql([1,1,2,2,3,3]);
        });

        it('should return the same array', function(){
            J.stretch(array, 1).should.be.eql(array);
            J.stretch(array).should.be.eql(array);
        });

        it('should repeat each element a custom number of times',
           function(){
               J.stretch(array, [1,2,3]).should.eql([1,2,2,3,3,3]);
        });

        it('should repeat each element a custom number of times (Recycling)',
           function(){
               J.stretch(array, [2,1]).should.eql([1,1,2,3,3]);
        });

    });

    describe('#transpose()', function() {

        var array = [ [1,2,3], [4,5,6] ];
        var t = [ [1,4], [2,5], [3,6] ];

        it('should transpose a 2D matrix', function(){
            J.transpose(array).should.eql(t);
        });
    });

});
