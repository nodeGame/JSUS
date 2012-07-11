var util = require('util');
    should = require('should'),
    JSUS = require('./../jsus').JSUS;
    
describe('PARSE: ', function(){
    
    // removeElement
    describe('#tokenize()', function(){
        var separators = [' ', ','];
        var str = "Ciao mamma, guarda come mi diverto";
        
        it('should returns an array of the right length', function(){
           var oo = JSUS.tokenize(str, separators);
           oo.length.should.be.eql(6);
           console.log(oo)
        });
        
//        it('should returns an array with the right tokens', function(){
//        	var test = ['Ciao', 'mamma', 'guarda', 'come', 'mi', 'diverto'];
//            var tokens = JSUS.tokenize(str, separators).should.be.eql(test);
//        });
//        
//        it('should be able to limit the number of returned tokens', function(){
//        	JSUS.tokenize(str, separators, {limit: 3}).length.should.be.eql(3); 
//        });
   
    });
    
   
    
});


