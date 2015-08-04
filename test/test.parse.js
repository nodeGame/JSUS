var util = require('util');
should = require('should'),
JSUS = require('./../jsus').JSUS;

var str_null, str_und, str_func, str_func2;
var str_obj, str_obj_special, str_obj_proto;

var f = function(a,b) { console.log(a+b); };

var f2 = function(a,b) {
    this.a = a;
    this.b = b;
};

var o = {
    a: "a",
    b: "b",
    c: 10
};

var os = {
    a: "a",
    b: null,
    c: undefined,
    d: function(a,b) { console.log(a+b); },
    e: function(a,b) { this.a = a; this.b = b; },
    f: NaN,
    g: Infinity,
    h: -Infinity
};


function ah() {};

ah.prototype.iamamethod = function(a){
    return a;
};

var obj_with_proto = new ah();

// Test also a function with comments in between
// and with comments with special characters.


describe('PARSE: ', function() {

    // removeElement
    describe('#tokenize()', function() {
        var separators = [' ', ','];
        var str = "Ciao mamma, guarda come mi diverto";

        it('should returns an array of the right length', function() {
            JSUS.tokenize(str, separators).length.should.be.eql(6);
        });

        it('should returns an array with the right tokens', function() {
            var test = ['Ciao', 'mamma', 'guarda', 'come', 'mi', 'diverto'];
            var tokens = JSUS.tokenize(str, separators).should.be.eql(test);
        });

        it('should be able to limit the number of returned tokens', function() {
            JSUS.tokenize(str, separators, {limit: 3}).length.should.be.eql(3);
        });

    });

    describe('#stringify()', function() {

        it('should stringify null', function() {
            str_null = JSUS.stringify(null);
            str_null.should.be.eql('"' + JSUS.stringify_prefix + "null" + '"');
        });

        it('should stringify undefined', function() {
            str_und = JSUS.stringify(undefined);
            str_und.should.be.eql('"' + JSUS.stringify_prefix +
                                  "undefined" + '"');
        });

        it('should stringify a function', function() {
            str_func = JSUS.stringify(f);
            str_func.should.be.eql('"' + JSUS.stringify_prefix +
                                   "function (a,b) { console.log(a+b); }" +
                                   '"');
        });

        it('should stringify a function with public properties', function() {
            var str;
            //str = "function (a,b) {\\n\\tthis.a = a;\\n\\tthis.b = b;\\n}\"";
            str = "function (a,b) {\\n    this.a = a;\\n    this.b = b;\\n}\""
            str_func2 = JSUS.stringify(f2);
            str_func2.should.be.eql('"' + JSUS.stringify_prefix + str);
        });

        it('should stringify a normal object (without prefix)', function() {
            str_obj = JSUS.stringify(o);
            str_obj.should.be.eql('{"a":"a","b":"b","c":10}');
        });



        it('should stringify objects with special values (prefix)', function() {
            var str, prfx;

            prfx = JSUS.stringify_prefix;
            str_obj_special = JSUS.stringify(os);

            str = '{"a":"a","b":"'
                + prfx  + 'null","c":"'
                + prfx + 'undefined","d":"'
                + prfx + 'function (a,b) { console.log(a+b); }","e":"'
                + prfx + 'function (a,b) { this.a = a; this.b = b; }\","f":"'
                + prfx + 'NaN","g":"'
                + prfx + 'Infinity","h":"'
                + prfx + '-Infinity"'
                + '}';

            str_obj_special.should.be.eql(str);
        });

    });

    describe('#stringifyAll()', function() {

        it('should stringify also properties of the prototype', function() {
            var strMethod;
            str_obj_proto = JSUS.stringifyAll(obj_with_proto);
            strMethod = '{"iamamethod":"!?_function (a){\\n    return a;\\n}"}';
            str_obj_proto.should.be.eql(strMethod);
        });
    });

    describe('#range()', function() {
        it('should handle multiplications of constants, intervals' +
            'negations, range notation and greater than notation',
            function() {
                var range = JSUS.range('2...5, >8 & !11','[-2,2*6]');
                range.should.eql([2,3,4,5,9,10,12]);
        });
        it('should understand \'begin\' and \'end\', handle divisions and ' +
            'modulo operations.', function() {
            var range = JSUS.range('begin...end/2 | 3*end/4...3...end',
                '[0,40) & %2 = 1');
            range.should.eql([1,3,5,7,9,11,13,15,17,19,29,35]);
        });
        it('should handle modulo operations in short notation', function() {
            var range = JSUS.range('<=19, 22, %5', '>6 & !>27');
            range.should.eql([7,8,9,10,11,12,13,14,15,16,17,18,19,20,22,25]);
        });
        it('should handle an iterable object as second input', function() {
            var range = JSUS.range('>4', {
                begin: 0,
                end: 21,
                prev: 0,
                cur: 1,
                next: function() {
                    var temp = this.prev;
                    this.prev = this.cur;
                    this.cur += temp;
                    return this.cur;
                },
                isFinished: function() {
                    return this.cur + this.prev > this.end;
                }
            });
            range.should.eql([5,8,13,21]);
        });
        it('should understand \'*\'', function() {
            var range = JSUS.range('*','(3,8) & !%4, 22, (10,12]');
            range.should.eql([5,6,7,11,12,22]);
        });

        it('should handle an array as second input', function() {
            var range = JSUS.range('%7', [6,7,8,9,12,21,25,14]);
            range.should.eql([7,21,14]);
        });
    });

    describe('#parse()', function() {


        it('should parse a stringified null value', function() {
            (null === JSUS.parse(str_null)).should.be.true;
        });

        it('should parse a stringified undefined value', function() {
            ('undefined' === typeof JSUS.parse(str_und)).should.be.true;
        });

        it('should parse a stringified function', function() {
            var a = JSUS.parse(str_func);
            a.toString().should.be.eql(f.toString());
        });

        it('should parse a stringified function with public properties',
           function() {

               var a = JSUS.parse(str_func2);
               a.toString().should.be.eql(f2.toString());
               var a_object = new a("a","b");
               a_object.a.should.be.equal("a");
               a_object.b.should.be.equal("b");
        });

        it('should parse a stringified normal object (no prefix)', function() {
            JSUS.parse(str_obj).should.be.eql(o);
        });

        it('should parse a stringified object with special values (prefix)',
           function() {

               var a = JSUS.parse(str_obj_special);
               JSUS.equals(a, os).should.be.true;
        });

    });


    describe('#funcName()', function() {
        it('should get the function name', function() {
            JSUS.funcName(ah).should.be.eql('ah');
        });

        it('should return empty string for anonymous functions', function() {
            JSUS.funcName(function() {}).should.be.eql('');
        });
    });

});
