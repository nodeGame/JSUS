var util = require('util');
    should = require('should'),
    JSUS = require('./../jsus').JSUS;
    
 
var str_null, str_und, str_func, str_func2, str_obj, str_obj_special, str_obj_proto;    
    

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

//console.log(obj_with_proto.iamamethod(1));
//console.log(typeof obj_with_proto.iamamethod);


// Test also a function with comments in between and with comments with special characters


describe('PARSE: ', function(){
    
    // removeElement
    describe('#tokenize()', function(){
        var separators = [' ', ','];
        var str = "Ciao mamma, guarda come mi diverto";
        
        it('should returns an array of the right length', function(){
           JSUS.tokenize(str, separators).length.should.be.eql(6);
        });
        
        it('should returns an array with the right tokens', function(){
        	var test = ['Ciao', 'mamma', 'guarda', 'come', 'mi', 'diverto'];
            var tokens = JSUS.tokenize(str, separators).should.be.eql(test);
        });
        
        it('should be able to limit the number of returned tokens', function(){
        	JSUS.tokenize(str, separators, {limit: 3}).length.should.be.eql(3); 
        });
   
    });
    
    describe('#stringify()', function(){
	
        it('should stringify null', function(){
            str_null = JSUS.stringify(null);
            str_null.should.be.eql('"' + JSUS.stringify_prefix + "null" + '"');
        });

        it('should stringify undefined', function(){
            str_und = JSUS.stringify(undefined);
            str_und.should.be.eql('"' + JSUS.stringify_prefix + "undefined" + '"');
        });
        
        it('should stringify a function', function(){
            str_func = JSUS.stringify(f);
            str_func.should.be.eql('"' + JSUS.stringify_prefix + "function (a,b) { console.log(a+b); }" + '"');
        });
        
        it('should stringify a function with public properties', function(){
            str_func2 = JSUS.stringify(f2);
            //console.log(JSUS.stringify_prefix + "function (a,b) {\n\tthis.a = a;\n\tthis.b = b;\n}")
            str_func2.should.be.eql('"' + JSUS.stringify_prefix + "function (a,b) {\\n\\tthis.a = a;\\n\\tthis.b = b;\\n}\"");
        });

        it('should stringify a normal object (without prefix)', function(){
            str_obj = JSUS.stringify(o);
            str_obj.should.be.eql('{"a":"a","b":"b","c":10}');
        });



        it('should stringify an object with special values (with prefix)', function(){        	
            str_obj_special = JSUS.stringify(os);
            
            var str = '{"a":"a","b":"' 
		+ JSUS.stringify_prefix + 'null","c":"' 
		+ JSUS.stringify_prefix + 'undefined","d":"' 
		+ JSUS.stringify_prefix + 'function (a,b) { console.log(a+b); }","e":"'
		+ JSUS.stringify_prefix + 'function (a,b) { this.a = a; this.b = b; }\","f":"'
		+ JSUS.stringify_prefix + 'NaN","g":"'
		+ JSUS.stringify_prefix + 'Infinity","h":"'
		+ JSUS.stringify_prefix + '-Infinity"'
		+ '}';

            str_obj_special.should.be.eql(str);
        });
	
    });

    describe('#stringifyAll()', function(){
    
//	it('should stringify an object with properties of the prototype', function(){
//            str_obj_proto = JSUS.stringifyAll(obj_with_proto);
//            console.log(str_obj_proto);
//	});
//	
    });
});



describe('#parse()', function(){
    
    
    it('should parse a stringified null value', function(){
       (null === JSUS.parse(str_null)).should.be.true;
    });

    it('should parse a stringified undefined value', function(){
    	('undefined' === typeof JSUS.parse(str_und)).should.be.true;
    });
    
    it('should parse a stringified function', function(){
    	var a = JSUS.parse(str_func);
    	a.toString().should.be.eql(f.toString());
    });

    it('should parse a stringified function with public properties', function(){
    	var a = JSUS.parse(str_func2);
    	a.toString().should.be.eql(f2.toString());
    	var a_object = new a("a","b");
    	a_object.a.should.be.equal("a");
    	a_object.b.should.be.equal("b");	
    });
    
    it('should parse a stringified normal object (without prefix)', function(){
    	JSUS.parse(str_obj).should.be.eql(o);
    });

    it('should parse a stringified object with special values (with prefix)', function(){
    	var a = JSUS.parse(str_obj_special);
    	JSUS.equals(a, os).should.be.true;    	
    });

});
