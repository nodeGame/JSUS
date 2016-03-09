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

describe('ARRAY: ', function(){

    // removeElement
    describe('#removeElement()', function(){
        var test_arr = ['element1', 'element2', 'element3', 'element4'];

        it('should return element3 when removing it from the array', function(){
            JSUS.removeElement('element3', test_arr).should.eql(['element3']);
        });
        it('should return false when removing element5 from array', function(){
            JSUS.removeElement('element5', test_arr).should.equal(false);
        });
    });

    // in_array
    describe('#in_array()', function(){
        var test_arr = ['element1', 'element2', 'element3', 'element4'];

        it('should return TRUE when looking for element1', function() {
            JSUS.in_array('element2', test_arr).should.be.true;
        });
        it('should return FALSE when looking for element5', function() {
            JSUS.in_array('element5', test_arr).should.be.false;
        });

    });


    describe('#latinSquare()', function() {
        var S = JSUS.randomInt(3,10); // start
        var L = JSUS.randomInt(3,S); // limit
        var ls = null

        before(function(){
            ls = JSUS.latinSquare(S,L);
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
        var S = JSUS.randomInt(3,10); // start
        var L = JSUS.randomInt(3,(S-1)); // limit
        var ls = null

        before(function(){
            ls = JSUS.latinSquareNoSelf(S,L);
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
            JSUS.isArray([]).should.be.true;
            JSUS.isArray(tests).should.be.true;

            JSUS.each(tests, function(e) {
                JSUS.isArray(e).should.not.be.true;
            });
        });


    });


    describe('#seq()', function() {

        it('should reproduce the sequence 0:5', function() {
            JSUS.seq(0,5).should.be.eql([0,1,2,3,4,5]);
        });

        it('should reproduce the sequence 5:0', function() {
            JSUS.seq(5,0).should.be.eql([5,4,3,2,1,0]);
        });

        it('should reproduce the sequence -5:0', function() {
            JSUS.seq(-5,0).should.be.eql([-5,-4,-3,-2,-1,0]);
        });

        it('should reproduce the sequence 0:-5', function() {
            JSUS.seq(0,-5).should.be.eql([0,-1,-2,-3,-4,-5]);
        });

        it('should reproduce the sequence -2:-2', function() {
            JSUS.seq(-2,2).should.be.eql([-2,-1,0,1,2]);
        });

        it('should reproduce return a single number array when start = end',
           function() {

               JSUS.seq(2,2).should.be.eql([2]);
        });

        it('should reproduce the sequence 0:5 with increment 2', function() {
            JSUS.seq(0,5,2).should.be.eql([0,2,4]);
        });

        it('should reproduce the sequence 5:0 with increment 2', function() {
            JSUS.seq(5,0,2).should.be.eql([5,3,1]);
        });

        it('should return false if parameters are missing or wrong',
           function() {

               JSUS.seq(-2).should.be.false;
               JSUS.seq('a',0).should.be.false;
               JSUS.seq().should.be.false;
               JSUS.seq(null, 0).should.be.false;
               JSUS.seq(undefined, 2).should.be.false;
               JSUS.seq(Infinity, 5).should.be.false;
               JSUS.seq(5,0,0).should.be.false;
        });

        it('should reproduce the sequence 5:0 and execute the callback',
           function() {
               var func = function(e){
                   if (e < 10) {
                       e = '0' + e;
                   }
                   return 'R_' + e;
               };
               JSUS.seq(1,4,1,func)
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
        var array = JSUS.seq(1,10);


        it('should return [6,7,8,9,10]', function() {
            JSUS.map(array, func).should.eql([6,7,8,9,10]);
        });

        it('should return [6,7,8,9,10,11]', function() {
            JSUS.map(array, func, 1).should.eql([6,7,8,9,10,11]);
        });

        it('should return [6,7,8,9,10,11,12]', function() {
            JSUS.map(array, func, 1, 1).should.eql([6,7,8,9,10,11,12]);
        });

        it('should return [6,7,8,9,10,11,12,13]', function() {
            JSUS.map(array, func, 1, 1, 1).should.eql([6,7,8,9,10,11,12,13]);
        });


    });

    describe('#rep()', function() {

        var array = JSUS.seq(1,5);


        it('should replicate an array twice', function() {
            JSUS.rep(array, 2).should.eql([1,2,3,4,5,1,2,3,4,5]);
        });

        it('should return the same array', function(){
            JSUS.rep(array, 1).should.be.eql(array);
            JSUS.rep(array).should.be.eql(array);
        });

        it('should replicate an array three times', function(){
            JSUS.rep(array, 3).should.eql([1,2,3,4,5,1,2,3,4,5,1,2,3,4,5]);
        });

    });

    describe('#distinct()', function() {

        it('should eliminate duplicated strings', function(){
            var array = ["a", "a", "b", "b", "c"];
            JSUS.distinct(array).should.eql(["a","b","c"]);
        });

        it('should eliminate duplicated numbers', function(){
            var array = [1,2,3,1,2,3,4,5,1,8];
            JSUS.distinct(array).should.eql([1,2,3,4,5,8]);
        });

        it('should eliminate duplicated special values', function(){
            var array = [null,null,{},{},0,0, undefined,Infinity,
                         Infinity, undefined];
            JSUS.distinct(array).should.be.eql([null,{},0,undefined,Infinity]);
        });

        it('should eliminate duplicated special values (NaN)', function(){
            var array = [NaN, NaN];
            var distinct = JSUS.distinct(array);
            distinct.length.should.be.eql(1);
            distinct[0].should.be.NaN;
        });

    });


    describe('#stretch()', function() {

        var array = [1,2,3];


        it('should repeat each element of the array twice', function(){
            JSUS.stretch(array, 2).should.eql([1,1,2,2,3,3]);
        });

        it('should return the same array', function(){
            JSUS.stretch(array, 1).should.be.eql(array);
            JSUS.stretch(array).should.be.eql(array);
        });

        it('should repeat each element a custom number of times',
           function(){
               JSUS.stretch(array, [1,2,3]).should.eql([1,2,2,3,3,3]);
        });

        it('should repeat each element a custom number of times (Recycling)',
           function(){
               JSUS.stretch(array, [2,1]).should.eql([1,1,2,3,3]);
        });

    });

    describe('#transpose()', function() {

        var array = [ [1,2,3], [4,5,6] ];
        var t = [ [1,4], [2,5], [3,6] ];

        it('should transpose a 2D matrix', function(){
            JSUS.transpose(array).should.eql(t);
        });
    });

});
