/**
 * # QUEUE
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Handles a simple queue of operations
 */
(function(JSUS) {

    "use strict";

    var QUEUE = {};

    QUEUE.getQueue = function() {
        return new Queue();
    };

    /**
     * ## Queue constructor
     */
    function Queue() {

        /**
         * ### Queue.queue
         *
         * The list of functions waiting to be executed.
         */
        this.queue = [];

        /**
         * ### Queue.inProgress
         *
         * The list of operations ids currently in progress.
         */
        this.inProgress = {};
    }

    /**
     * ### Queue.isReady
     *
     * Returns TRUE if no operation is in progress
     *
     * @return {boolean} TRUE, if no operation is in progress
     */
    Queue.prototype.isReady = function() {
        return JSUS.isEmpty(this.inProgress);
    };

    /**
     * ### Queue.onReady
     *
     * Executes the specified callback once the queue has been cleared
     *
     * Multiple functions to execute can be added, and they are executed
     * sequentially once the queue is cleared.
     *
     * If the queue is already cleared, the function is executed immediately.
     *
     * @param {function} cb The callback to execute
     */
    Queue.prototype.onReady = function(cb) {
        if ('function' !== typeof cb) {
            throw new TypeError('Queue.onReady: cb must be function. Found: ' +
                               cb);
        }
        if (JSUS.isEmpty(this.inProgress)) cb();
        else this.queue.push(cb);
    };

    /**
     * ### Queue.add
     *
     * Adds an item to the _inProgress_ index
     *
     * @param {string} key A tentative key name
     *
     * @return {string} The unique key to be used to unregister the operation
     */
    Queue.prototype.add = function(key) {
        if (key && 'string' !== typeof key) {
            throw new Error('Queue.add: key must be string.');
        }
        key = JSUS.uniqueKey(this.inProgress, key);
        if ('string' !== typeof key) {
            throw new Error('Queue.add: an error occurred ' +
                            'generating unique key.');
        }
        this.inProgress[key] = key;
        return key;
    };

    /**
     * ### Queue.remove
     *
     * Remove a specified key from the _inProgress_ index
     *
     * @param {string} key The key to remove from the _inProgress_ index.
     */
    Queue.prototype.remove = function(key) {
        if ('string' !== typeof key) {
            throw new Error('Queue.remove: key must be string.');
        }
        delete this.inProgress[key];
        if (JSUS.isEmpty(this.inProgress)) {
            this.executeAndClear();
        }
    };

    /**
     * ### Queue.getRemoveCb
     *
     * Returns a callback to remove an item from the _inProgress_ index
     *
     * This method is useful when the callbacks is defined inside loops,
     * so that a closure is created around the variable key.
     *
     * @param {string} key The key to remove from the _inProgress_ index.
     *
     * @see Queue.remove
     */
    Queue.prototype.getRemoveCb = function(key) {
        var that;
        if ('string' !== typeof key) {
            throw new Error('Queue.getRemoveCb: key must be string.');
        }
        that = this;
        return function() { that.remove(key); };
    };

    /**
     * ### Queue.executeAndClear
     *
     * Executes sequentially all callbacks, and removes them from the queue
     */
    Queue.prototype.executeAndClear = function() {
        var i, len;
        i = -1;
        len = this.queue.length;
        for ( ; ++i < len ; ) {
            this.queue[i]();
        }
    };

    JSUS.extend(QUEUE);

})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);
