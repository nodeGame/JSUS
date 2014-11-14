var util = require('util');
    should = require('should'),
    JSUS = require('./../jsus').JSUS;

var qId;
var foo = 1;
var foo2 = 2;
var q;

describe('QUEUE', function(){
    before(function() {
        q = JSUS.getQueue();
    });

    it('#getQueue() should get a new Queue object', function() {
        ('object' === typeof q).should.be.true;
    });

    it('the queue should block callback to be executed if non-ready (1/2)',
       function() {
    	   q.add('aa');
           q.add('bb');
           q.onReady(function() {
               foo = foo + 1;
           });
           foo.should.be.eql(1);
    });


    it('the queue should wait until it is completely free', function(){
        q.remove('bb');
        foo.should.be.eql(1);
    });

    it('the queue should block callback to be executed if non-ready (2/2)',
       function(){
           q.onReady(function() {
               foo2 = foo2 + 1;
           })
           foo.should.be.eql(1);
           foo2.should.be.eql(2);
    });

    it('the queue should assign automatically an id', function(){
        qId = q.add();
        ('string' === typeof qId).should.be.true;
    });


    it('clearing the queue should happen when all items are removed', function(){
        q.remove('aa');
        q.remove(qId);
        foo.should.be.eql(2);
        foo2.should.be.eql(3);
    });
});
