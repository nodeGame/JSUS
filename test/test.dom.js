var util = require('util');
    should = require('should'),
    JSUS = require('./../jsus').JSUS;

describe('DOM: ', function(){

    // removeElement
    describe('#sprintf()', function(){
        var separators = [' ', ','];
        var str = "@congrats, you received %howmany tokens.";
        var sub = {
        		'@congrats': {
        			style: "strong",

        		}
        };
        // TODO
        it('should returns an array of the right length', function(){
//           JSUS.tokenize(str, separators).length.should.be.eql(6);
        });



    });



});


