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
	    
	    it('should reproduce return a single number array when start = end', function() {
	    	JSUS.seq(2,2).should.be.eql([2]);
	    });
	    
	    it('should reproduce the sequence 0:5 with increment 2', function() {
	    	JSUS.seq(0,5,2).should.be.eql([0,2,4]);
	    });
	    
	    it('should reproduce the sequence 5:0 with increment 2', function() {
	    	JSUS.seq(5,0,2).should.be.eql([5,3,1]);
	    });
	    
	    it('should return false if parameters are missing or wrong', function() {
	    	JSUS.seq(-2).should.be.false;
	    	JSUS.seq('a',0).should.be.false;
	    	JSUS.seq().should.be.false;
	    	JSUS.seq(null, 0).should.be.false;
	    	JSUS.seq(undefined, 2).should.be.false;
	    	JSUS.seq(Infinity, 5).should.be.false;
	    	JSUS.seq(5,0,0).should.be.false;
	    });
	    
	    it('should reproduce the sequence 5:0 with and executing the callback on each increment', function() {
	    	var func = function(e){
	    		if (e < 10) {
	    			e = '0' + e;
	    		}
	    		return 'R_' + e;
	    	};
	    	JSUS.seq(1,4,1,func).should.be.eql(['R_01','R_02','R_03','R_04']);
	    });
		
    });
    
    
    describe('#map()', function() {
    	var func = function(e, i,t) {
    		if (i) e = e + i;
    		if (e > 5) return e;
    	};
    	var array = JSUS.seq(1,10);
    	
		
	    it('should return [6,7,8,9,10]', function(){
	    	JSUS.map(array, func).should.eql([6,7,8,9,10]);
		});

	    it('should return [6,7,8,9,10,11]', function(){
	    	JSUS.map(array, func, 1).should.eql([6,7,8,9,10,11]);
		});
	    
//	    it('should return undefined if no parameter is passed', function(){
//	    	should.strictEqual(undefined, JSUS.map());
//		});
		
    });
    
    describe('#rep()', function() {
    	
    	var array = JSUS.seq(1,5);
    	
		
	    it('should replicate an array twice', function(){
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
    
});


