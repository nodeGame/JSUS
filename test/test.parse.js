var util = require('util');
    should = require('should'),
    JSUS = require('./../jsus').JSUS;
    
describe('ARRAY: ', function(){
    
    // removeElement
    describe('#tokenize()', function(){
        var separators = [' ', '.'];
        var str = "Ciao mamma. Guarda come mi diverto.";
        
        it('should return element3 when removing it from the array', function(){
           var tokens = JSUS.tokenize(str, separators);
           console.log(tokens);
           tokens.length.should.be.eql(6); 
        });
   
    });
    
   
    
});


