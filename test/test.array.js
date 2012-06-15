var util = require('util');
    should = require('should'),
    JSUS = require('./../jsus').JSUS;
    
describe('ARRAY: ', function(){
    
    // removeElement
    describe('remove an element from an array', function(){
        var test_arr = ['element1', 'element2', 'element3', 'element4'];
        
        it('should return element3 when removing it from the array', function(){
           JSUS.removeElement('element3', test_arr).should.eql(['element3']); 
        });
        it('should return false when removing element5 from array', function(){
           JSUS.removeElement('element5', test_arr).should.equal(false); 
        });
    });
    
    // in_array
    describe('check if object is within array', function(){
        var test_arr = ['element1', 'element2', 'element3', 'element4'];
        
        it('should return TRUE when looking for element1', function(){
           JSUS.in_array('element2', test_arr).should.equal(true); 
        });
        it('should return FALSE when looking for element5', function(){
           JSUS.in_array('element5', test_arr).should.equal(false); 
        });
    });

    
    describe('#latinSquare()', function() {
    	var S = JSUS.randomInt(3,10); // start
		var L = JSUS.randomInt(3,S); // limit
		var ls = null 
    	
    	before(function(){
    		ls = JSUS.latinSquare(S,L);
    	});
		
		it('The size of the latin square should be correct', function() {
            ls.length.should.equal(L); 
        });
	
		it('The row of the latin square should have correct length', function() {	
			for (var z = 0; z < L; z++) {
				ls[z].length.should.equal((S));
			}
	    });
		
		it('Symbol "i" should appear once and only once each row', function(){
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
		
		it('Symbol "i" should appear at most once in each column', function(){
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
    
});


