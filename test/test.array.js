var util = require('util');
    should = require('should'),
    JSUS = require('JSUS').JSUS;
    
describe('array: ', function(){
    
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
    
});