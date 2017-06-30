/**
 * # JSUS: JavaScript UtilS.
 * Copyright(c) 2017 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Collection of general purpose javascript functions. JSUS helps!
 *
 * See README.md for extra help.
 * ---
 */
(function(exports) {

    var JSUS = exports.JSUS = {};

    // ## JSUS._classes
    // Reference to all the extensions
    JSUS._classes = {};

    // Make sure that the console is available also in old browser, e.g. < IE8.
    if ('undefined' === typeof console) console = {};
    if ('undefined' === typeof console.log) console.log = function() {};

    /**
     * ## JSUS.log
     *
     * Reference to standard out, by default `console.log`
     *
     * Override to redirect the standard output of all JSUS functions.
     *
     * @param {string} txt Text to output
     */
    JSUS.log = function(txt) {
        console.log(txt);
    };

    /**
     * ## JSUS.extend
     *
     * Extends JSUS with additional methods and or properties
     *
     * The first parameter can be an object literal or a function.
     * A reference of the original extending object is stored in
     * JSUS._classes
     *
     * If a second parameter is passed, that will be the target of the
     * extension.
     *
     * @param {object} additional Text to output
     * @param {object|function} target The object to extend
     *
     * @return {object|function} target The extended object
     *
     * @see JSUS.get
     */
    JSUS.extend = function(additional, target) {
        var name, prop;
        if ('object' !== typeof additional &&
            'function' !== typeof additional) {
            return target;
        }

        // If we are extending JSUS, store a reference
        // of the additional object into the hidden
        // JSUS._classes object;
        if ('undefined' === typeof target) {
            target = target || this;
            if ('function' === typeof additional) {
                name = additional.toString();
                name = name.substr('function '.length);
                name = name.substr(0, name.indexOf('('));
            }
            // Must be object.
            else {
                name = additional.constructor ||
                    additional.__proto__.constructor;
            }
            if (name) {
                this._classes[name] = additional;
            }
        }

        for (prop in additional) {
            if (additional.hasOwnProperty(prop)) {
                if (typeof target[prop] !== 'object') {
                    target[prop] = additional[prop];
                } else {
                    JSUS.extend(additional[prop], target[prop]);
                }
            }
        }

        // Additional is a class (Function)
        // TODO: this is true also for {}
        if (additional.prototype) {
            JSUS.extend(additional.prototype, target.prototype || target);
        }

        return target;
    };

    /**
     * ## JSUS.require
     *
     * Returns a copy of one / all the objects extending JSUS
     *
     * The first parameter is a string representation of the name of
     * the requested extending object. If no parameter is passed a copy
     * of all the extending objects is returned.
     *
     * @param {string} className The name of the requested JSUS library
     *
     * @return {function|boolean} The copy of the JSUS library, or
     *   FALSE if the library does not exist
     */
    JSUS.require = JSUS.get = function(className) {
        if ('undefined' === typeof JSUS.clone) {
            JSUS.log('JSUS.clone not found. Cannot continue.');
            return false;
        }
        if ('undefined' === typeof className) return JSUS.clone(JSUS._classes);
        if ('undefined' === typeof JSUS._classes[className]) {
            JSUS.log('Could not find class ' + className);
            return false;
        }
        return JSUS.clone(JSUS._classes[className]);
    };

    /**
     * ## JSUS.isNodeJS
     *
     * Returns TRUE when executed inside Node.JS environment
     *
     * @return {boolean} TRUE when executed inside Node.JS environment
     */
    JSUS.isNodeJS = function() {
        return 'undefined' !== typeof module &&
            'undefined' !== typeof module.exports &&
            'function' === typeof require;
    };

    // ## Node.JS includes
    // if node
    if (JSUS.isNodeJS()) {
        require('./lib/compatibility');
        require('./lib/obj');
        require('./lib/array');
        require('./lib/time');
        require('./lib/eval');
        require('./lib/dom');
        require('./lib/random');
        require('./lib/parse');
        require('./lib/queue');
        require('./lib/fs');
    }
    else {
        // Also exports J in the browser.
        exports.J = exports.JSUS;
    }
    // end node

})(
    'undefined' !== typeof module && 'undefined' !== typeof module.exports ?
        module.exports: window
);
